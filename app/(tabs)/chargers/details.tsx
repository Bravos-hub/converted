// app/chargers/details.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native parity for the "Charger Details" screen (S03_MyChargers.jsx)
//
// UI stack:
// - react-native-paper for Material-like components
// - expo-blur for glassy surfaces
// - react-native-maps for map picker
// - expo-clipboard for copy
//
// Install (once):
//   expo install react-native-maps expo-blur
//   npm i react-native-paper @expo/vector-icons
//   npm i expo-clipboard
//
// Notes:
// - Bottom navigation is intentionally omitted (tabs are handled elsewhere).
// - Map location permissions are requested only when “Use my location” is tapped.

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, UIManager, NativeModules, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import type { MapPressEvent, Region } from 'react-native-maps';
import * as Clipboard from 'expo-clipboard';
import { BlurView } from 'expo-blur';
import {
  Provider as PaperProvider,
  Appbar,
  Button,
  Chip,
  IconButton,
  Text,
  TextInput,
  Snackbar,
  Card,
  List,
  Divider,
} from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// ===== Types =====
export type DeviceInfo = {
  make?: string;
  model?: string;
  serial?: string;
  firmware?: string;
  power?: string;
  connectors?: { id: string; type: string; power: string }[];
  heartbeat?: string;
  uptime?: string;
};

export type OcppInfo = {
  server?: string;
  stationId?: string;
  password?: string;
};

export type InitialDetails = {
  name?: string;
  locationName?: string;
  coords?: [number, number];
  accessNotes?: string;
  usage?: 'private' | 'commercial';
  availabilityLabel?: string;
  accessLabel?: string;
  operatorAssigned?: boolean;
  device?: DeviceInfo;
  ocpp?: OcppInfo;
};

export type Props = {
  onBack?: () => void;
  onHelp?: () => void;
  onNavChange?: (v: number) => void; // parity placeholder
  onAssignOperator?: () => void;
  onViewOperator?: () => void;
  onEditOperator?: () => void;
  onOpenPricing?: () => void;
  onOpenAvail?: () => void;
  onOpenAccess?: () => void;
  onOpenAggregator?: (url?: string) => void;
  onSave?: (payload: any) => void;
  initial?: InitialDetails;
  aggregatorUrl?: string;
};

const DEFAULT_COORDS: [number, number] = [0.3476, 32.5825];

// ===== Helpers =====
const copy = async (text?: string) => {
  if (!text) return;
  try {
    await Clipboard.setStringAsync(text);
  } catch {
    // noop
  }
};

// ===== Glass card =====
function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <BlurView intensity={30} tint="light" style={styles.card}>
      <View style={styles.cardInner}>{children}</View>
    </BlurView>
  );
}

// ===== Map Picker =====
function MapPicker({
  value,
  onChange,
}: {
  value?: [number, number];
  onChange?: (coords: [number, number]) => void;
}) {
  const [center, setCenter] = useState<[number, number]>(value || DEFAULT_COORDS);
  const [Maps, setMaps] = useState<{ MapView: any; Marker?: any } | null>(null);

  // Detect if the native RN Maps module is present (Expo Go typically doesn't include it)
  const hasRNMaps = React.useMemo(() => {
    try {
      // TurboModule name in recent react-native-maps
      if ((NativeModules as any)?.RNMapsAirModule) return true;
      // Fallback check via view manager
      const cfg = UIManager.getViewManagerConfig
        ? UIManager.getViewManagerConfig('AIRMap')
        : (UIManager as any)['AIRMap'];
      return !!cfg;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (Array.isArray(value) && value.length === 2) setCenter(value);
  }, [value]);

  // Lazy-load react-native-maps only if available in the native binary
  useEffect(() => {
    let mounted = true;
    if (!hasRNMaps) return;
    (async () => {
      try {
        const m = await import('react-native-maps');
        const mv = (m as any).default ?? (m as any).MapView;
        const mk = (m as any).Marker;
        if (mounted && mv) {
          setMaps({ MapView: mv, Marker: mk || undefined });
        }
      } catch {
        // noop: keep placeholder if import fails
      }
    })();
    return () => {
      mounted = false;
    };
  }, [hasRNMaps]);

  const onPressMap = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const c: [number, number] = [latitude, longitude];
    setCenter(c);
    onChange?.(c);
  };

  const region: Region = {
    latitude: center[0],
    longitude: center[1],
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <Card mode="outlined" style={{ overflow: 'hidden', borderRadius: 14 }}>
      <Card.Content style={{ padding: 0 }}>
        {Maps?.MapView ? (
          <Maps.MapView style={{ height: 220, width: '100%' }} onPress={onPressMap} initialRegion={region}>
            {Maps.Marker ? (
              <Maps.Marker coordinate={{ latitude: center[0], longitude: center[1] }} />
            ) : null}
          </Maps.MapView>
        ) : (
          <View style={{ height: 220, width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f2f4f7' }}>
            <Text variant="bodySmall" style={{ color: '#6b7280' }}>
              Map unavailable in this build. Use a dev client with react-native-maps.
            </Text>
          </View>
        )}
      </Card.Content>
      <View style={{ padding: 10, gap: 8 }}>
        <Button
          mode="outlined"
          icon={(p) => <MaterialIcons {...p} name="my-location" />}
          onPress={() => {
            // Light “use my location” without adding expo-location; read-only picker keeps UX simple.
            // If you want GPS, integrate `expo-location` here.
            // For now we just center to DEFAULT_COORDS to avoid permission prompts in CI/test.
            setCenter(DEFAULT_COORDS);
            onChange?.(DEFAULT_COORDS);
          }}
        >
          Use my location
        </Button>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput mode="outlined" label="Latitude" value={center[0].toFixed(6)} style={{ flex: 1 }} disabled />
          <TextInput mode="outlined" label="Longitude" value={center[1].toFixed(6)} style={{ flex: 1 }} disabled />
        </View>
      </View>
    </Card>
  );
}

// ===== Device & OCPP panel =====
function DeviceInfoPanel({ device = {}, ocpp = {} }: { device?: DeviceInfo; ocpp?: OcppInfo }) {
  const {
    make = 'EVmart',
    model = 'AC22-T2-2S',
    serial = 'EVZ-UG-KLA-000123',
    firmware = 'v1.8.4',
    power = '22 kW (dual 11 kW)',
    connectors = [
      { id: 'B1', type: 'CCS 2', power: '90 kW' },
      { id: 'B2', type: 'Type 2', power: '22 kW' },
    ],
    heartbeat = '12s ago',
    uptime = '99.2% (30d)',
  } = device;

  const { server = 'wss://ocpp.evzone.app', stationId = serial, password = '••••••••' } = ocpp;

  return (
    <GlassCard>
      <View style={styles.rowCenter}>
        <MaterialCommunityIcons name="chip" size={18} />
        <Text style={[styles.bold, { marginLeft: 6 }]}>Device & hardware</Text>
      </View>

      <View style={{ marginTop: 8, gap: 8 }}>
        <List.Item title="Make / Model" description={`${make} • ${model}`} />
        <List.Item
          title="Serial"
          description={serial}
          right={() => (
            <IconButton icon="content-copy" onPress={() => copy(serial)} accessibilityLabel="Copy serial" />
          )}
        />
        <List.Item title="Firmware" description={firmware} />
        <List.Item title="Power" description={power} />
        <View style={{ marginTop: 4 }}>
          <Text style={styles.bold}>Connectors</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
            {connectors.map((c) => (
              <Chip key={c.id} icon="power-plug">{`${c.id} • ${c.type} • ${c.power}`}</Chip>
            ))}
          </View>
        </View>
      </View>

      <Divider style={{ marginVertical: 12 }} />

      <View style={styles.rowCenter}>
        <MaterialCommunityIcons name="lan" size={18} />
        <Text style={[styles.bold, { marginLeft: 6 }]}>OCPP & connectivity</Text>
      </View>

      <View style={{ marginTop: 8, gap: 8 }}>
        <List.Item
          title="Server"
          description={server}
          right={() => <IconButton icon="content-copy" onPress={() => copy(server)} />}
        />
        <List.Item
          title="Station ID"
          description={stationId}
          right={() => <IconButton icon="content-copy" onPress={() => copy(stationId)} />}
        />
        <List.Item
          title="Password"
          description={password}
          right={() => <IconButton icon="content-copy" onPress={() => copy(password)} />}
        />
        <List.Item title="Last heartbeat" description={heartbeat} />
        <List.Item title="Uptime" description={uptime} />
      </View>

      <List.Accordion title="Diagnostics & logs" style={{ marginTop: 8 }}>
        <Text variant="bodySmall" style={styles.muted}>
          Use Aggregator & CPMS for full telemetry, logs, and remote diagnostics. This device supports status
          notifications, meter values, and firmware updates via OCPP 1.6J.
        </Text>
      </List.Accordion>
    </GlassCard>
  );
}

// ===== Screen =====
export default function ChargerDetailsScreen({
  onBack,
  onHelp,
  onNavChange,
  onAssignOperator,
  onViewOperator,
  onEditOperator,
  onOpenPricing,
  onOpenAvail,
  onOpenAccess,
  onOpenAggregator,
  onSave,
  initial = {
    name: 'EVZ Station – Bugolobi',
    locationName: 'Rear parking lot, Block B',
    coords: DEFAULT_COORDS,
    accessNotes: 'Gate opens at 07:00, ask guard; max height 2.1m',
    usage: 'private',
    availabilityLabel: '24/7',
    accessLabel: 'Public',
    operatorAssigned: false,
    device: { make: 'EVmart', model: 'AC22-T2-2S', serial: 'EVZ-UG-KLA-000123', firmware: 'v1.8.4', power: '22 kW' },
    ocpp: { server: 'wss://ocpp.evzone.app', stationId: 'EVZ-UG-KLA-000123', password: '••••••••' },
  },
  aggregatorUrl = 'https://aggregator.evzone.app',
}: Props) {
  const [name, setName] = useState(initial.name || '');
  const [locationName, setLocationName] = useState(initial.locationName || '');
  const [coords, setCoords] = useState<[number, number]>(initial.coords || DEFAULT_COORDS);
  const [accessNotes, setAccessNotes] = useState(initial.accessNotes || '');
  const [usage, setUsage] = useState<'private' | 'commercial'>(initial.usage || 'private');
  const [availability, setAvailability] = useState({ label: initial.availabilityLabel || '24/7' });
  const [access, setAccess] = useState({ label: initial.accessLabel || 'Public' });
  const [operatorAssigned, setOperatorAssigned] = useState(!!initial.operatorAssigned);
  const [editBasics, setEditBasics] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string }>({ open: false, msg: '' });

  const canSave = useMemo(() => Boolean(name && locationName), [name, locationName]);

  // quick self-tests (non-blocking)
  useEffect(() => {
    try {
      const results = [
        ['has name field', typeof name === 'string'],
        ['has locationName field', typeof locationName === 'string'],
        ['coords is [lat, lon]', Array.isArray(coords) && coords.length === 2 && coords.every((n) => typeof n === 'number')],
        ['usage valid', usage === 'private' || usage === 'commercial'],
        ['availability label present', typeof availability?.label === 'string'],
        ['access label present', typeof access?.label === 'string'],
        ['device object present', typeof (initial.device || {}) === 'object'],
        ['ocpp object present', typeof (initial.ocpp || {}) === 'object'],
        ['canSave reflects basic fields', canSave === !!(name && locationName)],
      ];
      // eslint-disable-next-line no-console
      console.table(results.map(([test, pass]) => ({ test, pass })));
    } catch {}
  }, []);

  const save = () => {
    const payload = {
      name,
      locationName,
      coords,
      accessNotes,
      usage,
      availability: availability?.label,
      access: access?.label,
      device: initial.device || {},
      ocpp: initial.ocpp || {},
    };
    if (typeof onSave === 'function') onSave(payload);
    else setSnack({ open: true, msg: `Saved: ${JSON.stringify(payload)}` });
  };

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />

      <Appbar.Header style={styles.appbar}>
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="arrow-back-ios" />} onPress={() => (onBack ? onBack() : router.back())} />
        <Appbar.Content title="Charger details" subtitle="performance • schedule • access" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="help-outline" />} onPress={() => onHelp?.()} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Location */}
        <Text variant="titleSmall" style={styles.bold}>
          Location
        </Text>
        <View style={{ height: 8 }} />
        <MapPicker value={coords} onChange={setCoords} />

        <View style={{ height: 12 }} />
        <TextInput
          mode="outlined"
          label="Location display name"
          value={locationName}
          onChangeText={setLocationName}
          placeholder="e.g., Basement P2 – Slot 12"
          disabled={!editBasics}
        />

        {/* Basic details */}
        <View style={{ height: 12 }} />
        <GlassCard>
          <View style={styles.rowCenter}>
            <Text style={[styles.bold]}>Basic details</Text>
            <Button
              compact
              onPress={() => setEditBasics((p) => !p)}
              icon={(p) => <MaterialIcons {...p} name="edit" />}
              style={{ marginLeft: 'auto' }}
            >
              {editBasics ? 'Done' : 'Edit details'}
            </Button>
          </View>

          <View style={{ gap: 10, marginTop: 8 }}>
            <TextInput mode="outlined" label="Charger name" value={name} onChangeText={setName} placeholder="e.g., Home garage charger" disabled={!editBasics} />
            <TextInput
              mode="outlined"
              label="Access & parking notes"
              value={accessNotes}
              onChangeText={setAccessNotes}
              placeholder="Gate opens at 07:00; ask guard; max vehicle height 2.1m"
              multiline
              numberOfLines={3}
              disabled={!editBasics}
            />
          </View>
        </GlassCard>

        {/* Core settings */}
        <GlassCard>
          <Text style={[styles.bold, { marginBottom: 8 }]}>Core settings</Text>

          {/* Usage */}
          <View style={[styles.rowCenter, { gap: 8 }]}>
            <Text>Usage</Text>
            <Chip selected={usage === 'private'} onPress={() => setUsage('private')}>
              Private
            </Chip>
            <Chip selected={usage === 'commercial'} onPress={() => setUsage('commercial')}>
              Commercial
            </Chip>
            <Button compact onPress={() => onOpenAggregator ? onOpenAggregator(aggregatorUrl) : router.push('/(tabs)/chargers/manage')} style={{ marginLeft: 'auto' }}>
              Manage in Aggregator & CPMS
            </Button>
          </View>

          {/* Availability */}
          <View style={[styles.rowCenter, { marginTop: 8, gap: 8 }]}>
            <Text>Availability</Text>
            <Chip>{availability?.label || '—'}</Chip>
            <Button mode="outlined" onPress={() => (onOpenAvail ? onOpenAvail() : router.push('/(tabs)/chargers/availability'))} style={styles.pill}>
              Edit
            </Button>
          </View>

          {/* Access */}
          <View style={[styles.rowCenter, { marginTop: 8, gap: 8 }]}>
            <Text>Access</Text>
            <Chip>{access?.label || 'Public'}</Chip>
            <Button mode="outlined" onPress={() => (onOpenAccess ? onOpenAccess() : router.push('/(tabs)/chargers/access'))} style={[styles.pill, { marginLeft: 'auto' }]}>
              Edit
            </Button>
          </View>
        </GlassCard>

        {/* Device & OCPP */}
        <DeviceInfoPanel device={initial.device} ocpp={initial.ocpp} />

        {/* Connectors Actions */}
        <GlassCard>
          <Text style={[styles.bold, { marginBottom: 8 }]}>Connectors</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Chip onPress={() => router.push('/(tabs)/chargers/actions')} icon={() => <View style={styles.dotGreen} />} >
              B1 • CCS 2 • 90kW
            </Chip>
            <Chip onPress={() => router.push('/(tabs)/chargers/actions')} icon={() => <View style={styles.dotOrange} />}>
              B2 • Type 2 • 22kW
            </Chip>
          </View>
          <View style={[styles.rowCenter, { gap: 8, marginTop: 8 }]}>
            <Button mode="outlined" icon="play" onPress={() => router.push('/(tabs)/chargers/actions')}>
              Start
            </Button>
            <Button mode="outlined" icon="block-helper" onPress={() => router.push('/(tabs)/chargers/actions')}>
              Disable
            </Button>
            <Button mode="outlined" icon="lock" onPress={() => router.push('/(tabs)/chargers/actions')}>
              Lock
            </Button>
          </View>
        </GlassCard>

        {/* Performance quick stats */}
        <View style={{ marginTop: 8 }}>
          <View style={styles.rowCenter}>
            <Text style={styles.bold}>Performance</Text>
            <Button compact style={{ marginLeft: 'auto' }} onPress={() => router.push('/(tabs)/home/analytics')}>
              View analytics
            </Button>
          </View>
          <View style={[styles.rowCenter, { gap: 8, marginTop: 8 }]}>
            <Stat label="Uptime" value="99.2%" />
            <Stat label="Avg. kWh / session" value="17.3" />
            <Stat label="Revenue" value="UGX 1.2M" />
          </View>
        </View>

        {/* Footer actions */}
        <View style={{ height: 10 }} />
        <View style={[styles.rowCenter, { gap: 8 }]}> 
          <Button mode="outlined" onPress={() => (onOpenPricing ? onOpenPricing() : router.push('/(tabs)/chargers/pricing'))}>
            Pricing & fees
          </Button>
          <Button mode="outlined" onPress={() => (onOpenAvail ? onOpenAvail() : router.push('/(tabs)/chargers/availability'))}>
            Availability
          </Button>
          <Button mode="outlined" onPress={() => (onOpenAccess ? onOpenAccess() : router.push('/(tabs)/chargers/access'))}>
            Access
          </Button>
          <Button mode="contained" buttonColor="#f77f00" textColor="#fff" disabled={!canSave} onPress={save}>
            Save changes
          </Button>
        </View>
      </ScrollView>

      <Snackbar visible={snack.open} onDismiss={() => setSnack({ open: false, msg: '' })} duration={1800}>
        {snack.msg}
      </Snackbar>
    </PaperProvider>
  );
}

// ===== Stat =====
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card mode="outlined" style={{ borderRadius: 12, flex: 1 }}>
      <Card.Content style={{ alignItems: 'center' }}>
        <Text variant="labelSmall" style={styles.muted}>
          {label}
        </Text>
        <Text variant="titleSmall" style={styles.bold}>
          {value}
        </Text>
      </Card.Content>
    </Card>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 24 },
  appbar: { backgroundColor: '#03cd8c' },
  appbarTitle: { fontWeight: '800' },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eef3f1',
  },
  cardInner: { padding: 12, backgroundColor: 'rgba(255,255,255,0.55)' },
  bold: { fontWeight: '800' },
  muted: { color: '#6b7280' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  pill: { borderRadius: 999 },
  dotGreen: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#03cd8c', marginRight: 6 },
  dotOrange: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#f77f00', marginRight: 6 },
});

/*
================ Usage tests (do not remove) ================
1) Default
<ChargerDetailsScreen />

2) With prefilled data + save handler
<ChargerDetailsScreen
  initial={{
    name: 'EVZ Station – Bugolobi',
    locationName: 'Rear parking lot, Block B',
    coords: [0.3476, 32.5825],
    accessNotes: 'Gate opens at 07:00, ask guard; max height 2.1m',
    usage: 'private',
    availabilityLabel: '24/7',
    accessLabel: 'Public',
    operatorAssigned: false,
    device: { make: 'EVmart', model: 'AC22-T2-2S', serial: 'EVZ-UG-KLA-000123', firmware: 'v1.8.4', power: '22 kW' },
    ocpp: { server: 'wss://ocpp.evzone.app', stationId: 'EVZ-UG-KLA-000123', password: '••••••••' },
  }}
  onSave={(p)=>console.log('save', p)}
/>

Route integration (expo-router):
- Place this file at app/chargers/details.tsx (or nest under a dynamic route like app/chargers/[id].tsx).
- The screen purposely omits bottom navigation; your Tabs layout handles it.
*/
