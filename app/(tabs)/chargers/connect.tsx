// app/chargers/connect.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native version of the "Connect Charger" flow from S02_ConnectCharger.jsx
// - react-native-paper for Material-like UI
// - expo-blur for glassy blocks
// - SVG sparkline not needed here; we keep the stepper + forms, geo search placeholder.
// - Tabs nav omitted (handled by your Tabs layout)

/*
  What’s preserved:
  - Multi-step wizard (scanner, ID/serial entry, endpoint/auth, quick diagnostics, location, usage choice)
  - Photo capture hook point, QR start hook, pricing/access toggles, operator/aggregator CTA
  - “Only one Commercial Charger” guidance (warn-only flag)
  - Snackbars, “Continue on fail” flag, glassy blocks

  Hook points you can wire:
  - onScanQR, onPingEndpoint, onSaveConfig, onResolveAddress, onSearchPlace,
    onCreateCharger, onOpenAggregator, etc.
*/

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  Provider as PaperProvider,
  Appbar,
  Button,
  Chip,
  IconButton,
  Dialog,
  Portal,
  Text,
  Snackbar,
  TextInput,
  RadioButton,
  Switch,
  Divider,
  HelperText,
  Card,
  TouchableRipple
} from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// ===== Flags (parity with web) =====
const REQUIRE_PHOTO = true;
const ALLOW_CONTINUE_ON_FAIL = true;
const COMMERCIAL_LIMIT_WARN_ONLY = true;
const ENABLE_GEO_SEARCH = true;

// ===== Types =====
type ApiSnack = { open: boolean; msg: string; severity: 'success' | 'error' | 'warning' | 'info' };
type Access = { label: string };
type Availability = { label: string };
type Pricing = { model: 'kwh' | 'minute' };

type Props = {
  // Router handlers
  onBack?: () => void;
  onHelp?: () => void;

  // Actions you can wire to your backend
  onScanQR?: () => Promise<{ id?: string; serial?: string } | void>;
  onPingEndpoint?: (url: string, authToken?: string) => Promise<boolean>;
  onSaveConfig?: (payload: {
    id: string;
    serial?: string;
    endpoint: string;
    authToken?: string;
  }) => Promise<boolean>;
  onResolveAddress?: (coords: { lat: number; lng: number }) => Promise<string>;
  onSearchPlace?: (query: string) => Promise<Array<{ name: string; lat: number; lng: number }>>;
  onCreateCharger?: (payload: {
    id: string;
    serial?: string;
    endpoint: string;
    authToken?: string;
    coords?: { lat: number; lng: number };
    address?: string;
    choice?: 'private' | 'commercial';
  }) => Promise<{ ok: boolean; message?: string }>;

  // Commercial guard
  hasExistingCommercialInPrivate?: boolean;

  // Aggregator
  aggregatorUrl?: string;
  onOpenAggregator?: (url?: string) => void;
};

// ===== Reusable glassy card =====
function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardInner}>{children}</View>
    </View>
  );
}

export default function ConnectChargerScreen({
  onBack,
  onHelp,
  onScanQR,
  onPingEndpoint,
  onSaveConfig,
  onResolveAddress,
  onSearchPlace,
  onCreateCharger,
  hasExistingCommercialInPrivate,
  aggregatorUrl = 'https://aggregator.evzone.app',
  onOpenAggregator,
}: Props) {
  const router = useRouter();

  // ===== Wizard state =====
  const [step, setStep] = useState<number>(1);

  // Scanner / Identity
  const [id, setId] = useState('');
  const [serial, setSerial] = useState('');
  const [photoTaken, setPhotoTaken] = useState<boolean>(!REQUIRE_PHOTO);

  // OCPP / Endpoint
  const [endpoint, setEndpoint] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [pinging, setPinging] = useState(false);
  const [pingOk, setPingOk] = useState<boolean | null>(null);

  // Location
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Array<{ name: string; lat: number; lng: number }>>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | undefined>();
  const [address, setAddress] = useState<string>('');

  // Pricing / Access (quick)
  const [pricing, setPricing] = useState<Pricing>({ model: 'kwh' });
  const [availability] = useState<Availability>({ label: '24/7' });
  const [access, setAccess] = useState<Access>({ label: 'Public' });

  // Choice
  const [choice, setChoice] = useState<'private' | 'commercial'>('private');

  // Feedback
  const [snack, setSnack] = useState<ApiSnack>({ open: false, msg: '', severity: 'success' });

  // ===== Helpers =====
  const canContinueStep1 = !!id && (!REQUIRE_PHOTO || photoTaken);
  const canContinueStep2 = !!endpoint;
  const canFinish = !!id && !!endpoint;

  const toast = (msg: string, severity: ApiSnack['severity'] = 'info') =>
    setSnack({ open: true, msg, severity });

  // ===== Actions =====
  const handleScanQR = async () => {
    try {
      const res = await onScanQR?.();
      if (res?.id) setId(res.id);
      if (res?.serial) setSerial(res.serial);
      toast('Scanned QR successfully', 'success');
    } catch {
      toast('QR scan failed', 'error');
    }
  };

  const handlePing = async () => {
    setPingOk(null);
    setPinging(true);
    try {
      const ok = (await onPingEndpoint?.(endpoint, authToken)) ?? false;
      setPingOk(ok);
      toast(ok ? 'Endpoint reachable' : 'Ping failed', ok ? 'success' : 'warning');
    } catch {
      setPingOk(false);
      toast('Ping error', 'error');
    } finally {
      setPinging(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      const ok = (await onSaveConfig?.({ id, serial, endpoint, authToken })) ?? true;
      toast(ok ? 'Saved' : 'Save failed', ok ? 'success' : 'error');
      if (ok) setStep(3);
    } catch {
      toast('Save error', 'error');
    }
  };

  const handleSearch = async () => {
    if (!ENABLE_GEO_SEARCH || !onSearchPlace) return;
    setSearching(true);
    try {
      const res = await onSearchPlace(query);
      setResults(res ?? []);
    } catch {
      toast('Search failed', 'error');
    } finally {
      setSearching(false);
    }
  };

  const pickResult = async (r: { lat: number; lng: number; name: string }) => {
    setCoords({ lat: r.lat, lng: r.lng });
    try {
      const resolved = await onResolveAddress?.({ lat: r.lat, lng: r.lng });
      if (resolved) setAddress(resolved);
    } catch {
      /* ignore */
    }
  };

  const togglePricingModel = () =>
    setPricing((p) => ({ model: p.model === 'kwh' ? 'minute' : 'kwh' }));

  const toggleAccess = () =>
    setAccess((a) => ({ label: a.label === 'Public' ? 'Private' : 'Public' }));

  const doCreate = async () => {
    if (!canFinish) return toast('Missing required fields', 'warning');
    try {
      const res = await onCreateCharger?.({
        id, serial, endpoint, authToken, coords, address, choice,
      });
      if (res?.ok) {
        toast('Charger connected ✔', 'success');
        router.back();
      } else {
        toast(res?.message || 'Create failed', 'error');
      }
    } catch {
      toast('Create error', 'error');
    }
  };

  // ===== UI =====
  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />

      {/* App Bar */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.Action icon={(p) => <MaterialIcons name="arrow-back-ios" {...p} />} onPress={() => onBack?.() || router.back()} />
        <Appbar.Content title="Connect charger" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon={(p) => <MaterialIcons name="help-outline" {...p} />} onPress={() => onHelp?.()} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Step 1: Identify (QR / ID / Serial / Photo) */}
        {step === 1 && (
          <GlassCard>
            <Text variant="titleSmall" style={styles.bold}>Identify charger</Text>
            <View style={styles.rowGap}>
              <Button mode="outlined" icon={() => <MaterialIcons name="qr-code-scanner" size={18} />} onPress={handleScanQR} style={styles.pill}>
                Scan QR
              </Button>
              <TextInput label="Charger ID" value={id} onChangeText={setId} mode="outlined" />
              <TextInput label="Serial (optional)" value={serial} onChangeText={setSerial} mode="outlined" />
              <View style={styles.rowCenter}>
                <MaterialIcons name="photo-camera" size={18} />
                <Text style={{ marginLeft: 8 }}>Photo {photoTaken ? 'attached' : '(required)'}</Text>
                <Button mode="text" onPress={() => setPhotoTaken(true)} style={{ marginLeft: 'auto' }}>
                  {photoTaken ? 'Replace' : 'Add photo'}
                </Button>
              </View>
              {!canContinueStep1 && <HelperText type="error">Please add a photo and ID.</HelperText>}
              <Button mode="contained" disabled={!canContinueStep1} onPress={() => setStep(2)}>
                Continue
              </Button>
            </View>
          </GlassCard>
        )}

        {/* Step 2: Endpoint / Auth / Ping */}
        {step === 2 && (
          <GlassCard>
            <Text variant="titleSmall" style={styles.bold}>Network endpoint</Text>
            <View style={styles.rowGap}>
              <TextInput
                label="OCPP / Endpoint URL"
                value={endpoint}
                onChangeText={setEndpoint}
                mode="outlined"
                autoCapitalize="none"
              />
              <TextInput
                label="Auth token (optional)"
                value={authToken}
                onChangeText={setAuthToken}
                mode="outlined"
                secureTextEntry
              />
              <View style={styles.rowCenterGap}>
                <Button mode="outlined" onPress={handlePing} loading={pinging} style={styles.pill}>
                  Ping endpoint
                </Button>
                {pingOk === true && <Chip compact style={styles.successChip}>Reachable</Chip>}
                {pingOk === false && <Chip compact style={styles.warnChip}>Unreachable</Chip>}
              </View>
              <View style={styles.rowCenterGap}>
                <Button mode="outlined" onPress={() => setStep(1)} style={styles.pill}>Back</Button>
                <Button
                  mode="contained"
                  onPress={async () => {
                    const ok = onSaveConfig ? await handleSaveConfig() : (setStep(3), true);
                  }}
                  disabled={!canContinueStep2 && !ALLOW_CONTINUE_ON_FAIL}
                >
                  Save & Continue
                </Button>
              </View>
            </View>
          </GlassCard>
        )}

        {/* Step 3: Quick diagnostics (lightweight parity) */}
        {step === 3 && (
          <GlassCard>
            <Text variant="titleSmall" style={styles.bold}>Quick diagnostics</Text>
            <Text style={styles.caption}>
              We’ll run a quick check when you go live. You can continue now and resolve later if needed.
            </Text>
            <View style={styles.rowCenterGap}>
              <Button mode="outlined" onPress={() => setStep(2)} style={styles.pill}>Back</Button>
              <Button mode="contained" onPress={() => setStep(4)}>Continue</Button>
            </View>
          </GlassCard>
        )}

        {/* Step 4: Location (search + pick) */}
        {step === 4 && (
          <GlassCard>
            <Text variant="titleSmall" style={styles.bold}>Location</Text>
            <View style={styles.rowGap}>
              <TextInput
                label="Search (e.g., street, landmark)"
                value={query}
                onChangeText={setQuery}
                mode="outlined"
                right={<TextInput.Icon icon="magnify" onPress={handleSearch} />}
              />
              {/* Results list (simple) */}
              {ENABLE_GEO_SEARCH && results.length > 0 && (
                <Card mode="elevated">
                  {results.map((r, i) => (
                    <TouchableRipple key={`${r.name}-${i}`} onPress={() => pickResult(r)}>
                      <Card.Title
                        title={r.name}
                        subtitle={`${r.lat.toFixed(5)}, ${r.lng.toFixed(5)}`}
                        left={props => <MaterialIcons name="place" {...props} />}
                      />
                    </TouchableRipple>
                  ))}
                </Card>
              )}
              {/* Selected */}
              {coords && (
                <Chip>
                  Chosen: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} {address ? `• ${address}` : ''}
                </Chip>
              )}
              <View style={styles.rowCenterGap}>
                <Button mode="outlined" onPress={() => setStep(3)} style={styles.pill}>Back</Button>
                <Button mode="contained" onPress={() => setStep(5)}>Continue</Button>
              </View>
            </View>
          </GlassCard>
        )}

        {/* Step 5: Usage choice + quick pricing/access */}
        {step === 5 && (
          <GlassCard>
            <Text variant="titleSmall" style={styles.bold}>Choose usage</Text>

            {/* Choice */}
            <RadioButton.Group value={choice} onValueChange={(v) => setChoice(v as 'private' | 'commercial')}>
              <View style={styles.rowCenterGap}>
                <RadioButton value="private" />
                <Text>Private management only (monitor, control, alerts)</Text>
              </View>
              <View style={styles.rowCenterGap}>
                <RadioButton value="commercial" />
                <Text>Commercial (list publicly, accept payments & bookings)</Text>
              </View>
            </RadioButton.Group>

            {COMMERCIAL_LIMIT_WARN_ONLY && choice === 'commercial' && hasExistingCommercialInPrivate && (
              <Card mode="outlined" style={[styles.blockCard, { borderColor: '#f59e0b' }]}>
                <Card.Content>
                  <Text>
                    You already have one commercial charger under Private Charging. You can switch another to
                    non-commercial to free a slot, or continue and resolve in the aggregator.
                  </Text>
                </Card.Content>
              </Card>
            )}

            {/* Quick settings: pricing & access (same parity/toggles) */}
            <Divider style={{ marginVertical: 8 }} />
            <View style={styles.rowCenterGap}>
              <MaterialIcons name="request-quote" size={18} />
              <Text style={{ minWidth: 120 }}>Pricing model</Text>
              <Chip compact>{pricing.model === 'kwh' ? 'per kWh' : 'per minute'}</Chip>
              <Button mode="outlined" style={styles.pill} onPress={togglePricingModel}>Toggle</Button>
            </View>
            <View style={styles.rowCenterGap}>
              <MaterialIcons name="lock" size={18} />
              <Text style={{ minWidth: 120 }}>Access</Text>
              <Chip compact>{access.label}</Chip>
              <Button mode="outlined" style={styles.pill} onPress={toggleAccess}>Toggle</Button>
            </View>

            {/* Aggregator info */}
            <Divider style={{ marginVertical: 8 }} />
            <Text style={styles.caption}>
              Need more than one Commercial Charger? Manage unlimited stations with Aggregator & CPMS.
            </Text>

            <View style={styles.rowCenterGap}>
              <Button mode="outlined" onPress={() => setStep(4)} style={styles.pill}>Back</Button>
              <Button
                mode="contained"
                onPress={doCreate}
                disabled={!canFinish && !ALLOW_CONTINUE_ON_FAIL}
              >
                Finish
              </Button>
              <Button
                mode="text"
                icon={() => <MaterialIcons name="launch" size={16} />}
                onPress={() => onOpenAggregator?.(aggregatorUrl)}
              >
                Open Aggregator
              </Button>
            </View>
          </GlassCard>
        )}
      </ScrollView>

      {/* Snackbar */}
      <Snackbar visible={snack.open} onDismiss={() => setSnack((s) => ({ ...s, open: false }))} duration={2000}>
        {snack.msg}
      </Snackbar>
    </PaperProvider>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  appbar: { backgroundColor: '#03cd8c' },
  appbarTitle: { fontWeight: '800' },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eef3f1',
  },
  cardInner: { padding: 12, backgroundColor: '#ffffff' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  rowCenterGap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowGap: { gap: 8 },
  pill: { borderRadius: 999 },
  bold: { fontWeight: '800' },
  caption: { color: '#6b7280', marginTop: 4 },
  successChip: { backgroundColor: '#dcfce7' },
  warnChip: { backgroundColor: '#fff3cd' },
  blockCard: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
});

/*
================ Usage tests (do not remove) ================
1) Default
<ConnectChargerScreen />

2) With aggregator + commercial limit guard
<ConnectChargerScreen
  hasExistingCommercialInPrivate
  aggregatorUrl="https://aggregator.evzone.app"
  onOpenAggregator={(url) => console.log('open aggregator', url)}
/>

3) With fully-wired mocks
<ConnectChargerScreen
  onScanQR={async () => ({ id: 'EVZ-001', serial: 'SN-123' })}
  onPingEndpoint={async (url) => url.includes('wss://')}
  onSaveConfig={async () => true}
  onSearchPlace={async (q) => q ? [{ name: 'Makerere', lat: 0.338, lng: 32.57 }] : []}
  onResolveAddress={async () => 'Makerere, Kampala'}
  onCreateCharger={async () => ({ ok: true })}
/>

Routing:
- Save this file as app/chargers/connect.tsx
- Use your Tabs layout elsewhere; this screen intentionally doesn't render a bottom tab bar.
*/
