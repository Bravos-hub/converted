// app/chargers/availability.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native parity for S08_Availability.jsx
//
// Dependencies:
//   expo install expo-blur
//   npm i react-native-paper @expo/vector-icons
//
// Bottom navigation omitted (handled by Tabs layout)

import * as React from 'react';
import { router } from 'expo-router';
import { useState, useMemo, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import {
  Provider as PaperProvider,
  Appbar,
  Button,
  Card,
  Text,
  RadioButton,
  TextInput,
  Switch,
  Chip,
  IconButton,
  Snackbar,
} from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// ---------- Types
type Charger = { id: string; name: string };
type Connector = { id: string; label: string };
type Slot = { id: number; start: string; end: string };

type Props = {
  chargers?: Charger[];
  defaultChargerId?: string;
  commercialChargerId?: string;
  selectedChargerId?: string;
  aggregatorUrl?: string;
  onOpenAggregator?: (url?: string, chargerId?: string, connectorId?: string, scope?: string) => void;
  onBack?: () => void;
  onHelp?: () => void;
  onNavChange?: (v: number) => void;
  onSave?: (payload: any) => void;
};

// ---------- Example connectors
const CONNECTORS: Record<string, Connector[]> = {
  st1: [
    { id: 'c1', label: 'A1 — Type 2' },
    { id: 'c2', label: 'A2 — CCS 2' },
  ],
  st2: [{ id: 'c3', label: 'B1 — CHAdeMO' }],
};

// ---------- Glassy card
const GlassCard = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.card}>
    <View style={styles.cardInner}>{children}</View>
  </View>
);

// ---------- Day chips
function DayChips({ value, onChange }: { value: string[]; onChange: (d: string) => void }) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    <View style={styles.dayRow}>
      {days.map((d) => (
        <Chip
          key={d}
          selected={value.includes(d)}
          onPress={() => onChange(d)}
          compact
          style={value.includes(d) ? styles.dayChipOn : styles.dayChipOff}
        >
          {d}
        </Chip>
      ))}
    </View>
  );
}

// ---------- Screen
export default function AvailabilityScreen({
  chargers = [
    { id: 'st1', name: 'Home Charger' },
    { id: 'st2', name: 'Office Charger' },
  ],
  defaultChargerId = 'st1',
  commercialChargerId,
  selectedChargerId,
  aggregatorUrl,
  onOpenAggregator,
  onBack,
  onHelp,
  onSave,
}: Props) {
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [scope, setScope] = useState<'charger' | 'connector'>('charger');
  const connectors: Connector[] = useMemo(() => CONNECTORS[chargerId] ?? [], [chargerId]);
  const [connectorId, setConnectorId] = useState(connectors[0]?.id ?? '');
  useEffect(() => setConnectorId(CONNECTORS[chargerId]?.[0]?.id ?? ''), [chargerId]);

  const [online, setOnline] = useState(true);
  const [useMode, setUseMode] = useState<'Home' | 'Office' | 'Commercial'>('Home');
  const [model, setModel] = useState<'Day' | 'Night' | 'Manual'>('Manual');
  const [slots, setSlots] = useState<Slot[]>([{ id: 1, start: '09:30', end: '17:30' }]);
  const [days, setDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [timezone] = useState('Africa/Kampala');
  const [leadMins, setLeadMins] = useState(0);
  const [maxHours, setMaxHours] = useState(4);
  const [overnight, setOvernight] = useState(false);
  const [holidayMode, setHolidayMode] = useState(false);
  const [blackout, setBlackout] = useState('');
  const [snack, setSnack] = useState(false);

  const addSlot = () => setSlots((s) => [...s, { id: Date.now(), start: '09:00', end: '12:00' }]);
  const removeSlot = (id: number) => setSlots((s) => s.filter((x) => x.id !== id));
  const updateSlot = (id: number, patch: Partial<Slot>) => setSlots((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const handleSave = () => {
    const payload = {
      scope,
      chargerId,
      connectorId: scope === 'connector' ? connectorId : undefined,
      online,
      useMode,
      model,
      slots,
      days,
      timezone,
      leadMins,
      maxHours,
      overnight,
      holidayMode,
      blackout,
    };
    onSave ? onSave(payload) : console.log('Save availability', payload);
    setSnack(true);
  };

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <Appbar.Header style={styles.appbar}>
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="arrow-back-ios" />} onPress={() => (onBack ? onBack() : router.back())} />
        <Appbar.Content title="Availability" subtitle="set schedule per charger or connector" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="help-outline" />} onPress={() => onHelp?.()} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Target */}
        <GlassCard>
          <Text variant="titleSmall" style={styles.bold}>Target</Text>
          <Text variant="labelSmall" style={styles.muted}>Select charger and scope</Text>

          <Button mode="outlined" onPress={() => {}}>
            {chargers.find((c) => c.id === chargerId)?.name}
          </Button>

          <RadioButton.Group value={scope} onValueChange={(v) => setScope(v as 'charger' | 'connector')}>
            <View style={styles.rowCenter}>
              <RadioButton value="charger" /><Text>Charger</Text>
              <RadioButton value="connector" /><Text>Connector</Text>
            </View>
          </RadioButton.Group>

          {scope === 'connector' && (
            <Button mode="outlined" onPress={() => {}}>
              {connectors.find((k) => k.id === connectorId)?.label ?? 'Select connector'}
            </Button>
          )}
        </GlassCard>

        {/* Timezone + Aggregator */}
        <View style={styles.rowCenterBetween}>
          <Text variant="labelSmall" style={styles.muted}>Timezone: {timezone}</Text>
          <Button mode="text" textColor="#f77f00" onPress={() => onOpenAggregator?.(aggregatorUrl, chargerId, connectorId, scope)}>
            Aggregator & CPMS
          </Button>
        </View>

        {/* Status */}
        <GlassCard>
          <Text variant="titleSmall" style={styles.bold}>Status</Text>
          <RadioButton.Group value={online ? 'online' : 'offline'} onValueChange={(v) => setOnline(v === 'online')}>
            <View style={styles.rowCenter}>
              <RadioButton value="online" /><Text>Online</Text>
              <RadioButton value="offline" /><Text>Offline</Text>
            </View>
          </RadioButton.Group>
        </GlassCard>

        {/* Use mode */}
        <GlassCard>
          <Text variant="titleSmall" style={styles.bold}>Use mode</Text>
          <RadioButton.Group value={useMode} onValueChange={(v) => setUseMode(v as 'Home' | 'Office' | 'Commercial')}>
            <RadioButton.Item label="Home" value="Home" />
            <RadioButton.Item label="Office" value="Office" />
            <RadioButton.Item label="Commercial" value="Commercial" />
          </RadioButton.Group>
        </GlassCard>

        {/* Availability model */}
        <GlassCard>
          <Text variant="titleSmall" style={styles.bold}>Availability model</Text>
          <RadioButton.Group value={model} onValueChange={(v) => setModel(v as 'Day' | 'Night' | 'Manual')}>
            <RadioButton.Item label="Day (06:00–17:59)" value="Day" />
            <RadioButton.Item label="Night (18:00–05:59)" value="Night" />
            <RadioButton.Item label="Manual (custom schedule)" value="Manual" />
          </RadioButton.Group>

          {model === 'Manual' && (
            <View>
              {slots.map((s) => (
                <Card key={s.id} style={styles.periodCard}>
                  <Card.Content>
                    <View style={styles.rowGap}>
                      <TextInput label="Start" value={s.start} onChangeText={(v) => updateSlot(s.id, { start: v })} style={{ flex: 1 }} />
                      <TextInput label="End" value={s.end} onChangeText={(v) => updateSlot(s.id, { end: v })} style={{ flex: 1 }} />
                      <IconButton icon="delete-outline" iconColor="#ef4444" onPress={() => removeSlot(s.id)} />
                    </View>
                  </Card.Content>
                </Card>
              ))}
              <Button icon="plus" onPress={addSlot}>Add time</Button>
              <Text variant="labelSmall" style={[styles.bold, { marginTop: 6 }]}>Days</Text>
              <DayChips value={days} onChange={(d) => setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])} />
            </View>
          )}
        </GlassCard>

        {/* Advanced rules */}
        <GlassCard>
          <Text variant="titleSmall" style={styles.bold}>Advanced rules</Text>
          <View style={styles.rowGap}>
            <TextInput label="Lead time (min)" value={leadMins.toString()} onChangeText={(v) => setLeadMins(Number(v) || 0)} keyboardType="numeric" style={{ flex: 1 }} />
            <TextInput label="Max session (hrs)" value={maxHours.toString()} onChangeText={(v) => setMaxHours(Number(v) || 0)} keyboardType="numeric" style={{ flex: 1 }} />
          </View>
          <View style={styles.rowGap}>
            <Switch value={overnight} onValueChange={setOvernight} /><Text>Allow overnight</Text>
          </View>
          <View style={styles.rowGap}>
            <Switch value={holidayMode} onValueChange={setHolidayMode} /><Text>Holiday mode</Text>
          </View>
          <TextInput label="Blackout dates / notes" value={blackout} onChangeText={setBlackout} placeholder="e.g., 2025-12-25" />
        </GlassCard>

        <Button mode="contained" buttonColor="#f77f00" textColor="#fff" style={styles.saveBtn} onPress={handleSave}>
          Save availability
        </Button>
      </ScrollView>

      <Snackbar visible={snack} onDismiss={() => setSnack(false)} duration={1500}>
        Availability saved!
      </Snackbar>
    </PaperProvider>
  );
}

// ---------- Styles
const styles = StyleSheet.create({
  appbar: { backgroundColor: '#03cd8c' },
  appbarTitle: { fontWeight: '800' },
  container: { padding: 16, paddingBottom: 60 },
  card: { borderRadius: 14, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: '#eef3f1', marginBottom: 12 },
  cardInner: { padding: 12, backgroundColor: '#ffffff' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  rowCenterBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 4 },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bold: { fontWeight: '800' },
  muted: { color: '#6b7280' },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  dayChipOn: { backgroundColor: '#f77f00' },
  dayChipOff: { backgroundColor: '#f2f2f2' },
  periodCard: { marginBottom: 8, borderRadius: 12 },
  saveBtn: { borderRadius: 999, marginTop: 12 },
});

/*
================ Usage tests (do not remove) ================
1) Default
<AvailabilityScreen />

2) With onSave
<AvailabilityScreen onSave={(p)=>console.log('saved',p)} />

Route integration (expo-router):
- Place this file at app/chargers/availability.tsx.
- Bottom navigation is intentionally omitted.
*/
