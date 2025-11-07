// app/chargers/manage.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native parity for S04_ChargerDetails.jsx (UI + behavior preserved, no bottom tabs)
//
// UI stack:
// - react-native-paper (components)
// - expo-blur (glassy surfaces)
// - react-native-maps (map picker)
//
// Install once:
//   expo install react-native-maps expo-blur
//   npm i react-native-paper @expo/vector-icons
//
// TypeScript config (tsconfig.json):
//   { "compilerOptions": { "jsx": "react-jsx", "types": ["react", "react-native", "expo", "expo-router"] } }

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, UIManager, NativeModules, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import type { MapPressEvent, Region } from 'react-native-maps';
import {
  Provider as PaperProvider,
  Appbar,
  Button,
  Chip,
  IconButton,
  Text,
  Snackbar,
  Card,
  TextInput,
  Divider,
  Switch,
  List,
  Portal,
} from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  onBack?: () => void;
  onHelp?: () => void;
  onAssignOperator?: () => void;
  onViewOperator?: () => void;
  onEditOperator?: () => void;
  onOpenPricing?: () => void;
  onOpenAvail?: () => void;
  onOpenAccess?: () => void;
  onOpenAggregator?: (url?: string) => void;
  onSave?: (payload: any) => void;

  initial?: {
    name?: string;
    locationName?: string;
    coords?: [number, number];
    accessNotes?: string;
    usage?: 'private' | 'commercial';
    availabilityLabel?: string;
    accessLabel?: string;
    operatorAssigned?: boolean;
  };
  aggregatorUrl?: string;
};

const DEFAULT_COORDS: [number, number] = [0.3476, 32.5825]; // Kampala

// ---------- Reusable
function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardInner}>{children}</View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card mode="outlined" style={styles.statCard}>
      <Card.Content style={{ alignItems: 'center' }}>
        <Text variant="labelSmall" style={styles.muted}>{label}</Text>
        <Text variant="titleSmall" style={styles.bold}>{value}</Text>
      </Card.Content>
    </Card>
  );
}

// ---------- Map picker (tap to set, simple "Use my location" shim)
function MapPicker({
  value,
  onChange,
}: {
  value?: [number, number];
  onChange?: (coords: [number, number]) => void;
}) {
  const [center, setCenter] = useState<[number, number]>(value || DEFAULT_COORDS);
  const [Maps, setMaps] = useState<{ MapView: any; Marker?: any } | null>(null);

  const hasRNMaps = React.useMemo(() => {
    try {
      if ((NativeModules as any)?.RNMapsAirModule) return true;
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
        // keep placeholder if import fails
      }
    })();
    return () => {
      mounted = false;
    };
  }, [hasRNMaps]);

  const onPress = (e: MapPressEvent) => {
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
    <Card mode="outlined" style={{ borderRadius: 14, overflow: 'hidden' }}>
      <Card.Content style={{ padding: 0 }}>
        {Maps?.MapView ? (
          <Maps.MapView style={{ height: 220 }} initialRegion={region} onPress={onPress}>
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
            // Keep behavior simple (no runtime permissions): reset to DEFAULT_COORDS.
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

// ---------- Screen
export default function ManageChargerScreen({
  onBack,
  onHelp,
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
  const [operatorAssigned] = useState(!!initial.operatorAssigned);

  // Amenities
  const [amenRestroom, setAmenRestroom] = useState(true);
  const [amenFood, setAmenFood] = useState(false);
  const [amen247, setAmen247] = useState(true);
  const [amenSecurity, setAmenSecurity] = useState(false);

  const [editBasics, setEditBasics] = useState(false);
  const canSave = useMemo(() => Boolean(name && locationName), [name, locationName]);
  const [snack, setSnack] = useState<{ open: boolean; msg: string }>({ open: false, msg: '' });

  // Dev self-tests (parity checks)
  useEffect(() => {
    try {
      const results: Array<{ test: string; pass: boolean }> = [];
      const check = (t: string, c: boolean) => results.push({ test: t, pass: !!c });
      check('has name field', typeof name === 'string');
      check('has locationName field', typeof locationName === 'string');
      check('coords is [lat,lon]', Array.isArray(coords) && coords.length === 2);
      check('usage valid', usage === 'private' || usage === 'commercial');
      check('availability label present', typeof availability?.label === 'string');
      check('access label present', typeof access?.label === 'string');
      check('canSave reflects fields', canSave === !!(name && locationName));
      // eslint-disable-next-line no-console
      console.table(results);
    } catch {}
  }, []);

  const handleSave = () => {
    const payload = {
      name,
      locationName,
      coords,
      accessNotes,
      usage,
      availability: availability?.label,
      access: access?.label,
      amenities: {
        restroom: amenRestroom,
        foodDrinks: amenFood,
        open247: amen247,
        security: amenSecurity,
      },
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
        <Text variant="titleSmall" style={styles.bold}>Location</Text>
        <View style={{ height: 8 }} />
        <MapPicker value={coords} onChange={setCoords} />
        <View style={{ height: 10 }} />
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
            <TextInput
              mode="outlined"
              label="Charger name"
              value={name}
              onChangeText={setName}
              placeholder="e.g., Home garage charger"
              disabled={!editBasics}
            />
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
            <Chip selected={usage === 'private'} onPress={() => setUsage('private')}>Private</Chip>
            <Chip selected={usage === 'commercial'} onPress={() => setUsage('commercial')}>Commercial</Chip>
            <Button compact onPress={() => (onOpenAggregator ? onOpenAggregator(aggregatorUrl) : router.push('/(tabs)/chargers/manage'))} style={{ marginLeft: 'auto' }}>
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
            <Button mode="outlined" onPress={() => (onOpenAccess ? onOpenAccess() : router.push('/(tabs)/chargers/access'))} style={[styles.pill, { marginLeft: 'auto' }]}>Edit</Button>
          </View>
        </GlassCard>

        {/* Monthly overview (parity) */}
        <View style={{ marginTop: 8 }}>
          <View style={styles.rowCenter}>
            <Text style={styles.bold}>September overview</Text>
            <Button compact style={{ marginLeft: 'auto' }} onPress={() => router.push('/(tabs)/home/analytics')}>View details</Button>
          </View>
          <View style={[styles.rowCenter, { gap: 8, marginTop: 8 }]}>
            <Stat label="Cost" value="UGX 240,000" />
            <Stat label="Energy" value="128.5 kWh" />
            <Stat label="Sessions" value="3" />
            <Stat label="Duration" value="15:00" />
          </View>
        </View>

        {/* Operator card */}
        <View style={{ marginTop: 8 }}>
          {!operatorAssigned ? (
            <GlassCard>
              <Text variant="titleSmall" style={styles.bold}>No operator assigned</Text>
              <Text variant="bodySmall" style={styles.muted}>Assign an accredited operator to manage operations and support.</Text>
              <Button mode="contained" buttonColor="#f77f00" textColor="#fff" onPress={() => onAssignOperator?.()} style={{ marginTop: 10 }}>
                Assign operator
              </Button>
            </GlassCard>
          ) : (
            <GlassCard>
              <View style={styles.rowCenter}>
                <Chip mode="flat" selected>Online</Chip>
                <Text style={[styles.bold, { marginLeft: 8 }]}>Robert Fox</Text>
                <Text style={[styles.muted, { marginLeft: 6 }]}>Shift: Day</Text>
                <View style={{ marginLeft: 'auto', flexDirection: 'row', gap: 8 }}>
                  <Button mode="outlined" onPress={() => onViewOperator?.()}>View</Button>
                  <Button mode="outlined" onPress={() => onEditOperator?.()}>Edit</Button>
                </View>
              </View>
            </GlassCard>
          )}
        </View>

        {/* Amenities */}
        <GlassCard>
          <Text style={[styles.bold, { marginBottom: 8 }]}>Amenities</Text>
          <List.Item
            title="Restroom"
            right={() => <Switch value={amenRestroom} onValueChange={setAmenRestroom} />}
          />
          <Divider />
          <List.Item
            title="Food & drinks"
            right={() => <Switch value={amenFood} onValueChange={setAmenFood} />}
          />
          <Divider />
          <List.Item
            title="24/7"
            right={() => <Switch value={amen247} onValueChange={setAmen247} />}
          />
          <Divider />
          <List.Item
            title="Security"
            right={() => <Switch value={amenSecurity} onValueChange={setAmenSecurity} />}
          />
        </GlassCard>

        {/* Connectors quick actions */}
        <GlassCard>
          <Text style={[styles.bold, { marginBottom: 8 }]}>Connectors</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Chip onPress={() => router.push('/(tabs)/chargers/actions')} icon={() => <View style={[styles.dot, { backgroundColor: '#03cd8c' }]} />}>
              B1 • CCS 2 • 90kW
            </Chip>
            <Chip onPress={() => router.push('/(tabs)/chargers/actions')} icon={() => <View style={[styles.dot, { backgroundColor: '#f77f00' }]} />}>
              B2 • Type 2 • 22kW
            </Chip>
          </View>
          <View style={[styles.rowCenter, { gap: 8, marginTop: 8 }]}>
            <Button mode="outlined" icon="play" onPress={() => router.push('/(tabs)/chargers/actions')}>Start</Button>
            <Button mode="outlined" icon="block-helper" onPress={() => router.push('/(tabs)/chargers/actions')}>Disable</Button>
            <Button mode="outlined" icon="lock" onPress={() => router.push('/(tabs)/chargers/actions')}>Lock</Button>
          </View>
        </GlassCard>

        {/* Performance quick stats */}
        <View style={{ marginTop: 8 }}>
          <View style={styles.rowCenter}>
            <Text style={styles.bold}>Performance</Text>
            <Button compact style={{ marginLeft: 'auto' }} onPress={() => router.push('/(tabs)/home/analytics')}>View analytics</Button>
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
          <Button mode="outlined" onPress={() => (onBack ? onBack() : router.back())} style={{ marginRight: 'auto' }}>
            Back
          </Button>
          <Button mode="outlined" onPress={() => (onOpenPricing ? onOpenPricing() : router.push('/(tabs)/chargers/pricing'))}>
            Pricing & fees
          </Button>
          <Button mode="outlined" onPress={() => (onOpenAvail ? onOpenAvail() : router.push('/(tabs)/chargers/availability'))}>
            Availability
          </Button>
          <Button mode="outlined" onPress={() => (onOpenAccess ? onOpenAccess() : router.push('/(tabs)/chargers/access'))}>
            Access
          </Button>
          <Button mode="contained" buttonColor="#f77f00" textColor="#fff" disabled={!canSave} onPress={handleSave}>
            Save changes
          </Button>
        </View>
      </ScrollView>

      <Snackbar visible={snack.open} onDismiss={() => setSnack({ open: false, msg: '' })} duration={2000}>
        {snack.msg}
      </Snackbar>
    </PaperProvider>
  );
}

// ---------- Styles
const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 24 },
  appbar: { backgroundColor: '#03cd8c' },
  appbarTitle: { fontWeight: '800' },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eef3f1',
  },
  cardInner: { padding: 12, backgroundColor: '#ffffff' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  bold: { fontWeight: '800' },
  muted: { color: '#6b7280' },
  pill: { borderRadius: 999 },
  statCard: { borderRadius: 12, flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
});

/*
================ Usage tests (do not remove) ================
1) Default
<ManageChargerScreen />

2) With save handler
<ManageChargerScreen
  onSave={(p)=>console.log('save', p)}
/>

3) With different initial values
<ManageChargerScreen
  initial={{
    name: 'Station A',
    locationName: 'Lot C',
    coords: [0.315, 32.61],
    accessNotes: 'Ask security',
    usage: 'commercial',
    availabilityLabel: '09:00–18:00',
    accessLabel: 'Public',
    operatorAssigned: true,
  }}
  onViewOperator={()=>console.log('view operator')}
  onEditOperator={()=>console.log('edit operator')}
/>

Route integration (expo-router):
- Place this file at app/chargers/manage.tsx (or any route you prefer).
- Bottom tabs are intentionally omitted; your Tabs layout handles navigation.
*/
