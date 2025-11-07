// app/chargers/add.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native conversion of S01_AddCharger.jsx (UI + behavior parity, no bottom tabs)
// - react-native-paper for UI
// - expo-blur for glassy cards
// - Preserves: source selector, scan/manual actions, manual form, connectors builder, single consent, tip card
// - Footer actions retained via in-screen sticky action bar
//
// Install (if not already):
//   expo install expo-blur react-native-svg
//   npm i react-native-paper @expo/vector-icons

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Modal } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Camera, CameraView, type BarcodeScanningResult } from 'expo-camera';
import { Provider as PaperProvider, Appbar, Button, Text, Menu, TextInput, Card, Divider, Checkbox, RadioButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

// ===== Types =====
export type Connector = { id: number; label: string; type: string; powerKw: string };
export type ManualForm = { make: string; model: string; serial: string; ocpp: '1.6J' | '2.0.1'; powerKw: string; reseller?: string };

export type Props = {
  onBack?: () => void;
  onNotifications?: () => void;
  onOpenAggregator?: () => void;
  onScan?: () => void;
  onContinue?: (payload: {
    source: 'evmart' | 'other';
    startedManual: boolean;
    form: ManualForm;
    connectors: Connector[];
    consent: boolean;
  }) => void;
};

const EV = { green: '#03cd8c', orange: '#f77f00', bg: '#f7f9f8', divider: '#eef3f1' };

function GlassCard({ children, style, innerStyle }: { children: React.ReactNode; style?: any; innerStyle?: any }) {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.cardInner, innerStyle]}>{children}</View>
    </View>
  );
}

export default function AddChargerScreen({ onBack, onNotifications, onOpenAggregator, onScan, onContinue }: Props) {
  const router = useRouter();
  const [source, setSource] = useState<'evmart' | 'other'>('evmart');
  const [showManual, setShowManual] = useState(false);
  const [form, setForm] = useState<ManualForm>({ make: '', model: '', serial: '', ocpp: '1.6J', powerKw: '', reseller: '' });
  const [connectors, setConnectors] = useState<Connector[]>([{ id: 1, label: 'A1', type: 'Type 2', powerKw: '' }]);
  const [consent, setConsent] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrSupported, setQrSupported] = useState<boolean>(false);

  const connectorTypes = ['Type 2', 'CCS 2', 'CHAdeMO', 'GB/T'] as const;

  const addConnector = () => setConnectors(prev => [...prev, { id: Date.now(), label: `A${prev.length + 1}`, type: 'Type 2', powerKw: '' }]);
  const updateConnector = (id: number, patch: Partial<Connector>) => setConnectors(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)));
  const removeConnector = (id: number) => setConnectors(prev => (prev.length <= 1 ? prev : prev.filter(c => c.id !== id)));

  const canContinue = useMemo(() => {
    if (!consent) return false;
    if (!showManual) return true; // QR path, collect details later
    const makeOk = !!form.make?.trim();
    const modelOk = !!form.model?.trim();
    const serialOk = !!form.serial?.trim();
    const ocppOk = !!form.ocpp?.trim();
    const powerOk = form.powerKw !== '' && !Number.isNaN(Number(form.powerKw));
    const hasConnector = connectors.length >= 1;
    const connectorTypesOk = connectors.every(c => !!c.type?.trim());
    const connectorLabelsOk = connectors.every(c => !!c.label?.trim());
    return makeOk && modelOk && serialOk && ocppOk && powerOk && hasConnector && connectorTypesOk && connectorLabelsOk;
  }, [showManual, consent, form, connectors]);

  // Dev self-tests (console only)
  useEffect(() => {
    try {
      const results: { test: string; pass: boolean }[] = [];
      const check = (name: string, cond: any) => results.push({ test: name, pass: !!cond });
      check('default source is evmart', source === 'evmart');
      check('manual form hidden initially', !showManual);
      check('consent single boolean defaults false', consent === false);
      check('connectors array exists', Array.isArray(connectors));
      check('first connector has label and type', !!connectors[0].label && !!connectors[0].type);
      console.table(results);
    } catch {}
  }, [source, showManual, consent, connectors]);

  // Lazy-detect QR scanner support
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const supported =
          typeof CameraView.isModernBarcodeScannerAvailable === 'boolean'
            ? CameraView.isModernBarcodeScannerAvailable
            : undefined;
        if (supported !== undefined) {
          if (mounted) setQrSupported(supported);
          return;
        }
        const available = await CameraView.isAvailableAsync();
        if (mounted) setQrSupported(!!available);
      } catch {
        if (mounted) setQrSupported(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Appbar */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.Action icon={(props) => <MaterialIcons name="arrow-back-ios" {...props} />} onPress={() => (onBack ? onBack() : router.back())} />
        <Appbar.Content title="Add charger" subtitle="welcome • select source • add details" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon={(props) => <MaterialIcons name="notifications" {...props} />} onPress={() => (onNotifications ? onNotifications() : router.push('/(tabs)/settings/notificationrules'))} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Hero */}
        <GlassCard>
          <View style={{ alignItems: 'center' }}>
            <MaterialIcons name="bolt" size={22} color={EV.green} />
            <Text variant="titleSmall" style={[styles.bold, { marginTop: 6 }]}>Everything you need to set up your charger</Text>
            <Text variant="bodySmall" style={{ color: '#111111' }}>Connect any compliant charger — monetize one with EVzone or just manage it privately.</Text>
          </View>
        </GlassCard>

        {/* Source selector */}
        <View style={styles.colGap}>
          <Pressable onPress={() => setSource('evmart')}>
            <Card mode="outlined" style={[styles.blockCard, { borderColor: source === 'evmart' ? EV.orange : EV.divider }]}> 
              <Card.Content style={styles.rowCenter}>
                <RadioButton value="evmart" status={source === 'evmart' ? 'checked' : 'unchecked'} color={EV.orange} />
                <MaterialIcons name="storefront" size={18} color={EV.orange} />
                <View style={{ marginLeft: 8 }}>
                  <Text variant="titleSmall" style={styles.bold}>EVmart‑certified</Text>
                  <Text variant="bodySmall" style={styles.muted}>If bought from EVzone&apos;s EVmart or MyLiveDealz, the charger is pre‑tested for compliance.</Text>
                </View>
              </Card.Content>
            </Card>
          </Pressable>

          <Pressable onPress={() => setSource('other')}>
            <Card mode="outlined" style={[styles.blockCard, { borderColor: source === 'other' ? EV.orange : EV.divider }]}> 
              <Card.Content style={styles.rowCenter}>
                <RadioButton value="other" status={source === 'other' ? 'checked' : 'unchecked'} color={EV.orange} />
                <MaterialIcons name="cable" size={18} color={EV.orange} />
                <View style={{ marginLeft: 8 }}>
                  <Text variant="titleSmall" style={styles.bold}>Other brand (OCPP 1.6J+)</Text>
                  <Text variant="bodySmall" style={styles.muted}>Add any compatible OCPP 1.6J or higher charger. We’ll help you pass compliance checks.</Text>
                </View>
              </Card.Content>
            </Card>
          </Pressable>
        </View>

        {/* Actions */}
        <View style={styles.colGap}>
          <GlassCard innerStyle={{ backgroundColor: 'rgba(3,205,140,0.08)' }}>
            <View style={[styles.colCenter, { alignItems: 'center' }]}> 
              <MaterialIcons name="qr-code-scanner" size={20} color={EV.orange} />
              <Text variant="titleSmall" style={[styles.bold, { marginTop: 6 }]}>Scan QR on the charger</Text>
              <Text variant="bodySmall" style={{ color: '#111111' }}>Fastest way to pull serial & model</Text>
              <Button mode="contained" icon={() => <MaterialIcons name="qr-code-scanner" size={16} />} onPress={() => { onScan?.(); setQrOpen(true); }} style={[styles.pill, { backgroundColor: EV.orange }]}>Scan QR</Button>
            </View>
          </GlassCard>

          <GlassCard innerStyle={{ backgroundColor: 'rgba(3,205,140,0.08)' }}>
            <View style={[styles.colCenter, { alignItems: 'center' }]}> 
              <MaterialIcons name="add-circle-outline" size={20} color={EV.green} />
              <Text variant="titleSmall" style={[styles.bold, { marginTop: 6 }]}>Add manually</Text>
              <Text variant="bodySmall" style={{ color: '#111111' }}>Enter charger make, model & serial</Text>
              <Button mode="outlined" onPress={() => setShowManual(true)} style={styles.pill} textColor={EV.green}>Add manually</Button>
            </View>
          </GlassCard>
        </View>

        {/* Manual form */}
        {showManual && (
          <GlassCard>
            <Text variant="titleSmall" style={styles.bold}>Charger details</Text>
            <View style={styles.grid2}>
              <TextInput label="Make" value={form.make} onChangeText={(v) => setForm({ ...form, make: v })} />
              <TextInput label="Model" value={form.model} onChangeText={(v) => setForm({ ...form, model: v })} />
              <TextInput label="Serial" value={form.serial} onChangeText={(v) => setForm({ ...form, serial: v })} />
              {/* OCPP select simplified as toggles (or replace with a proper picker) */}
              <Menu
                visible={false}
                onDismiss={() => {}}
                anchor={<Button mode="outlined">OCPP: {form.ocpp}</Button>}
              >
                <Menu.Item title="1.6J" onPress={() => setForm({ ...form, ocpp: '1.6J' })} />
                <Menu.Item title="2.0.1" onPress={() => setForm({ ...form, ocpp: '2.0.1' })} />
              </Menu>
              <TextInput label="Charger max (kW)" value={form.powerKw} inputMode="decimal" onChangeText={(v) => setForm({ ...form, powerKw: v })} />
            </View>

            <Divider style={{ marginVertical: 12 }} />
            <View style={styles.rowCenter}><Text variant="titleSmall" style={styles.bold}>Connectors (ports)</Text><Text variant="bodySmall" style={[styles.muted, { marginLeft: 8 }]}>Add one or more ports if this unit has multiple connectors.</Text></View>

            <View style={styles.colGap}>
              {connectors.map((c) => (
                <Card key={c.id} mode="outlined">
                  <Card.Content>
                    <View style={styles.grid3}>
                      <TextInput label="Label / Port ID" value={c.label} onChangeText={(v) => updateConnector(c.id, { label: v })} />
                      <Menu visible={false} onDismiss={() => {}} anchor={<Button mode="outlined">Type: {c.type}</Button>}>
                        {connectorTypes.map(t => (
                          <Menu.Item key={t} title={t} onPress={() => updateConnector(c.id, { type: t })} />
                        ))}
                      </Menu>
                      <TextInput label="Power (kW)" value={c.powerKw} inputMode="decimal" onChangeText={(v) => updateConnector(c.id, { powerKw: v })} />
                    </View>
                    <View style={[styles.rowCenter, { justifyContent: 'flex-end' }]}>
                      <Button mode="text" textColor="#ef4444" onPress={() => removeConnector(c.id)} disabled={connectors.length <= 1} icon={() => <MaterialIcons name="delete-outline" size={18} color="#ef4444" />}>Remove</Button>
                    </View>
                  </Card.Content>
                </Card>
              ))}
              <Button mode="text" onPress={addConnector} icon={() => <MaterialIcons name="add-circle-outline" size={18} />}>Add connector</Button>
            </View>
          </GlassCard>
        )}

        {/* Consent */}
        <GlassCard>
            <View style={styles.rowCenter}>
              <Checkbox status={consent ? 'checked' : 'unchecked'} onPress={() => setConsent(!consent)} />
            <Text variant="bodySmall">I agree to the <Text style={styles.link} onPress={() => console.log('Open Terms')}>Terms of Service</Text> and <Text style={styles.link} onPress={() => console.log('Open Privacy Policy')}>Privacy Policy</Text></Text>
            </View>
        </GlassCard>

        {/* Tip card */}
        <View style={[styles.card, { borderColor: EV.orange }]}> 
          <View style={[styles.cardInner, { backgroundColor: 'rgba(247,127,0,0.06)' }]}> 
            <View style={styles.rowCenter}>
              <MaterialIcons name="info" size={18} color={EV.orange} />
              <Text variant="bodySmall" style={[styles.muted, { marginLeft: 8 }]}>You can connect for monitoring/alerts without monetizing. You may monetize exactly one <Text style={styles.bold}>Commercial Charger</Text> in Private Charging. Need more? <Text style={[styles.link, { color: EV.orange }]} onPress={() => (onOpenAggregator ? onOpenAggregator() : router.push('/(tabs)/settings/aggregatorbridge'))}>EVzone Aggregator & CPMS</Text>.</Text>
            </View>
          </View>
        </View>

        {/* Primary action in scroll */}
        <View style={{ marginTop: 12, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button mode="outlined" onPress={() => (onBack ? onBack() : router.back())} style={[styles.pill, { flex: 1 }]} textColor={EV.green}>Back</Button>
            <Button
              mode="contained"
              disabled={!canContinue}
              onPress={() => {
                const payload = { source, startedManual: showManual, form, connectors, consent };
                if (onContinue) {
                  onContinue(payload);
                } else {
                  // Default: return to chargers list
                  router.replace('/(tabs)/chargers');
                }
              }}
              style={[styles.pill, { backgroundColor: EV.orange, flex: 1 }]}
            >
              Save & Continue
            </Button>
          </View>
        </View>
      </ScrollView>

      {/* QR modal */}
      <Modal visible={qrOpen} onRequestClose={() => setQrOpen(false)} animationType="slide" presentationStyle="fullScreen">
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          {/* Header */}
          <View style={{ paddingTop: 48, paddingHorizontal: 16, paddingBottom: 8, backgroundColor: '#000', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Scan QR</Text>
            <Button mode="text" textColor="#fff" onPress={() => setQrOpen(false)}>Close</Button>
          </View>
          {/* Scanner area */}
          {qrSupported ? (
            <ScannerView
              active={qrOpen}
              onScanned={(val: string) => {
                setShowManual(true);
                setForm((f) => ({ ...f, serial: val }));
                setQrOpen(false);
              }}
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialIcons name="qr-code-scanner" size={64} color="#fff" />
              <Text style={{ color: '#fff', marginTop: 12, textAlign: 'center' }}>QR scanner not available in this build.</Text>
              <Button mode="contained" onPress={() => setQrOpen(false)} style={[styles.pill, { marginTop: 12 }]}>Done</Button>
            </View>
          )}
        </View>
      </Modal>

    </PaperProvider>
  );
}

// Lightweight wrapper around expo-barcode-scanner if available
function ScannerView({ onScanned, active }: { onScanned: (val: string) => void; active: boolean }) {
  const [permission, setPermission] = React.useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [scanEnabled, setScanEnabled] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (!mounted) return;
        const normalized: 'granted' | 'denied' | 'undetermined' =
          status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined';
        setPermission(normalized);
      } catch {
        if (mounted) setPermission('denied');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (active) {
      setScanEnabled(true);
    }
  }, [active]);

  const handleScan = React.useCallback(
    (scanningResult: BarcodeScanningResult) => {
      if (!scanningResult?.data) {
        return;
      }
      setScanEnabled(false);
      onScanned(scanningResult.data);
    },
    [onScanned]
  );

  if (!active || permission !== 'granted') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff' }}>
          {permission === 'denied' ? 'Camera permission denied' : 'Requesting camera permission…'}
        </Text>
      </View>
    );
  }

  return (
    <CameraView
      style={{ flex: 1 }}
      facing="back"
      barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      onBarcodeScanned={scanEnabled ? handleScan : undefined}
    />
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 24, backgroundColor: EV.bg },
  appbar: { backgroundColor: EV.green },
  appbarTitle: { fontWeight: '800' },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: EV.divider
  },
  cardInner: { padding: 12, backgroundColor: '#ffffff' },
  blockCard: { borderRadius: 14, overflow: 'hidden', marginBottom: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: EV.divider },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  colCenter: { gap: 6 },
  bold: { fontWeight: '800' },
  muted: { color: '#6b7280' },
  link: { textDecorationLine: 'underline' },
  colGap: { gap: 10 },
  grid2: { gap: 10 },
  grid3: { gap: 10 },
  pill: { borderRadius: 999 },
  footerBar: {},
});

/*
================ Usage tests (do not remove) ================
1) Default
<AddChargerScreen onContinue={(p)=>console.log('continue', p)} />

2) Manual flow + connectors
<AddChargerScreen onContinue={(p)=>console.log('continue', p)} />
// Tap "Add manually" then fill out the fields and add/remove connectors.

Route integration (expo-router):
- Place this file at app/chargers/add.tsx and link to it from your app.
- Bottom navigation is intentionally omitted; your Tabs layout handles it elsewhere.
*/
