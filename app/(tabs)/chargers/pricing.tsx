// app/chargers/pricing.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native parity for S07_Pricing&Fees.jsx
//
// Dependencies:
//   expo install expo-blur
//   npm i react-native-paper @expo/vector-icons
//
// Optional picker alternative:
//   npm i @react-native-picker/picker
//
// Bottom navigation intentionally omitted (handled by Tabs layout)

import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { BlurView } from 'expo-blur';
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
  HelperText,
  IconButton,
  Snackbar,
  Divider,
} from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// ---------- Types
type Charger = { id: string; name: string };
type Connector = { id: string; label: string };
type Period = { id: number; name: string; start: string; end: string; days: string[]; rate: number };

type Props = {
  chargers?: Charger[];
  defaultChargerId?: string;
  onBack?: () => void;
  onHelp?: () => void;
  onSave?: (payload: any) => void;
  prefillTOU?: Period[];
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
  <BlurView intensity={30} tint="light" style={styles.card}>
    <View style={styles.cardInner}>{children}</View>
  </BlurView>
);

// ---------- Small weekday chips
function DayChips({ value, onChange }: { value: string[]; onChange: (d: string) => void }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
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
export default function PricingFeesScreen({
  chargers = [
    { id: 'st1', name: 'Home Charger' },
    { id: 'st2', name: 'Office Charger' },
  ],
  defaultChargerId = 'st1',
  onBack,
  onHelp,
  onSave,
  prefillTOU,
}: Props) {
  const [chargerId, setChargerId] = useState<string>(defaultChargerId);
  const [scope, setScope] = useState<'charger' | 'connector'>('charger');
  const connectors: Connector[] = useMemo(() => CONNECTORS[chargerId] ?? [], [chargerId]);
  const [connectorId, setConnectorId] = useState<string>(connectors[0]?.id ?? '');
  useEffect(() => setConnectorId(CONNECTORS[chargerId]?.[0]?.id ?? ''), [chargerId]);

  // pricing state
  const [chargeBy, setChargeBy] = useState<'energy' | 'duration'>('energy');
  const [rate, setRate] = useState(1200);
  const [vat, setVat] = useState(18);
  const [includeVat, setIncludeVat] = useState(false);

  const [model, setModel] = useState<'single' | 'tou'>('single');
  const [periods, setPeriods] = useState<Period[]>([
    { id: 1, name: 'Evening', start: '18:00', end: '23:59', days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], rate: 1500 },
  ]);

  // extras
  const [idleEnabled, setIdleEnabled] = useState(true);
  const [idleRate, setIdleRate] = useState(200);
  const [idleGrace, setIdleGrace] = useState(10);
  const [minChargeEnabled, setMinChargeEnabled] = useState(false);
  const [minCharge, setMinCharge] = useState(3000);
  const [freeMinutesEnabled, setFreeMinutesEnabled] = useState(false);
  const [freeMinutes, setFreeMinutes] = useState(5);
  const [cancelFeeEnabled, setCancelFeeEnabled] = useState(false);
  const [cancelFee, setCancelFee] = useState(2000);
  const [membershipDiscEnabled, setMembershipDiscEnabled] = useState(false);
  const [membershipDiscPct, setMembershipDiscPct] = useState(5);

  const [bookingFlatEnabled, setBookingFlatEnabled] = useState(true);
  const [bookingFlat, setBookingFlat] = useState(5000);
  const [bookingPctEnabled, setBookingPctEnabled] = useState(true);
  const [bookingPct, setBookingPct] = useState(10);

  const [timing, setTiming] = useState<'prepaid' | 'postpaid'>('prepaid');
  const [snack, setSnack] = useState(false);

  // TOU prefill
  useEffect(() => {
    if (prefillTOU?.length) {
      setModel('tou');
      setPeriods(prefillTOU.map((p, i) => ({ ...p, id: Date.now() + i })));
    }
  }, [prefillTOU]);

  const addPeriod = () => setPeriods((p) => [...p, { id: Date.now(), name: 'Custom', start: '09:00', end: '12:00', days: ['Mon','Tue','Wed'], rate }]);
  const removePeriod = (id: number) => setPeriods((p) => p.filter((x) => x.id !== id));
  const updatePeriod = (id: number, patch: Partial<Period>) => setPeriods((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const handleSave = () => {
    const payload = {
      scope,
      chargerId,
      connectorId: scope === 'connector' ? connectorId : undefined,
      chargeBy,
      rate,
      vat,
      includeVat,
      model,
      periods,
      idleEnabled,
      idleRate,
      idleGrace,
      minChargeEnabled,
      minCharge,
      freeMinutesEnabled,
      freeMinutes,
      cancelFeeEnabled,
      cancelFee,
      membershipDiscEnabled,
      membershipDiscPct,
      bookingFlatEnabled,
      bookingFlat,
      bookingPctEnabled,
      bookingPct,
      timing,
    };
    onSave ? onSave(payload) : console.log('Save pricing', payload);
    setSnack(true);
  };

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <Appbar.Header style={styles.appbar}>
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="arrow-back-ios" />} onPress={() => (onBack ? onBack() : router.back())} />
        <Appbar.Content title="Pricing & fees" subtitle="per-charger or per-connector with TOU" titleStyle={styles.appbarTitle} />
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

        {/* Basic pricing */}
        <GlassCard>
          <Text variant="titleSmall" style={styles.bold}>Basic pricing</Text>
          <RadioButton.Group value={chargeBy} onValueChange={(v) => setChargeBy(v as 'energy' | 'duration')}>
            <View style={styles.rowCenter}>
              <RadioButton value="energy" /><Text>Energy (UGX/kWh)</Text>
              <RadioButton value="duration" /><Text>Duration (UGX/min)</Text>
            </View>
          </RadioButton.Group>

          <View style={styles.rowGap}>
            <TextInput label={`Rate (UGX/${chargeBy === 'energy' ? 'kWh' : 'min'})`} value={rate.toString()} onChangeText={(v) => setRate(Number(v) || 0)} keyboardType="numeric" style={{ flex: 1 }} />
            <TextInput label="VAT (%)" value={vat.toString()} onChangeText={(v) => setVat(Number(v) || 0)} keyboardType="numeric" style={{ width: 100 }} />
          </View>
          <View style={styles.rowCenter}>
            <Switch value={includeVat} onValueChange={setIncludeVat} /><Text>Prices include VAT</Text>
          </View>
        </GlassCard>

        {/* Pricing model */}
        <GlassCard>
          <Text variant="titleSmall" style={styles.bold}>Pricing model</Text>
          <RadioButton.Group value={model} onValueChange={(v) => setModel(v as 'single' | 'tou')}>
            <RadioButton.Item label="Single rate (all times)" value="single" />
            <RadioButton.Item label="Time-of-Use" value="tou" />
          </RadioButton.Group>

          {model === 'tou' && (
            <View>
              {periods.map((p) => (
                <Card key={p.id} style={styles.periodCard}>
                  <Card.Content>
                    <View style={styles.rowCenterBetween}>
                      <TextInput label="Name" value={p.name} onChangeText={(v) => updatePeriod(p.id, { name: v })} style={{ flex: 1 }} />
                      <IconButton icon="delete-outline" iconColor="#ef4444" onPress={() => removePeriod(p.id)} />
                    </View>
                    <View style={styles.rowGap}>
                      <TextInput label="Start" value={p.start} onChangeText={(v) => updatePeriod(p.id, { start: v })} style={{ flex: 1 }} />
                      <TextInput label="End" value={p.end} onChangeText={(v) => updatePeriod(p.id, { end: v })} style={{ flex: 1 }} />
                    </View>
                    <DayChips value={p.days} onChange={(d) => updatePeriod(p.id, { days: p.days.includes(d) ? p.days.filter((x) => x !== d) : [...p.days, d] })} />
                    <TextInput label={`Rate (UGX/${chargeBy === 'energy' ? 'kWh' : 'min'})`} value={p.rate.toString()} onChangeText={(v) => updatePeriod(p.id, { rate: Number(v) || 0 })} keyboardType="numeric" />
                  </Card.Content>
                </Card>
              ))}
              <Button icon="plus" onPress={addPeriod}>Add TOU period</Button>
            </View>
          )}
        </GlassCard>

        {/* Extras */}
        <GlassCard>
          <Text variant="titleSmall" style={styles.bold}>Extra fees & rules</Text>
          <View style={styles.spacer8} />
          <View style={styles.rowGap}>
            <Switch value={idleEnabled} onValueChange={setIdleEnabled} /><Text>Idle fee after grace</Text>
          </View>
          <View style={styles.rowGap}>
            <TextInput label="Grace (min)" value={idleGrace.toString()} onChangeText={(v) => setIdleGrace(Number(v)||0)} keyboardType="numeric" style={{ flex: 1 }} />
            <TextInput label="Idle rate (UGX/min)" value={idleRate.toString()} onChangeText={(v) => setIdleRate(Number(v)||0)} keyboardType="numeric" style={{ flex: 1 }} />
          </View>

          <Divider style={{ marginVertical: 6 }} />

          <View style={styles.rowGap}>
            <Switch value={minChargeEnabled} onValueChange={setMinChargeEnabled} /><Text>Minimum session charge</Text>
          </View>
          <TextInput label="Min charge (UGX)" value={minCharge.toString()} onChangeText={(v) => setMinCharge(Number(v)||0)} keyboardType="numeric" />

          <View style={styles.rowGap}>
            <Switch value={freeMinutesEnabled} onValueChange={setFreeMinutesEnabled} /><Text>Free minutes at start</Text>
          </View>
          <TextInput label="Free (min)" value={freeMinutes.toString()} onChangeText={(v) => setFreeMinutes(Number(v)||0)} keyboardType="numeric" />

          <View style={styles.rowGap}>
            <Switch value={cancelFeeEnabled} onValueChange={setCancelFeeEnabled} /><Text>Cancellation fee</Text>
          </View>
          <TextInput label="Cancel fee (UGX)" value={cancelFee.toString()} onChangeText={(v) => setCancelFee(Number(v)||0)} keyboardType="numeric" />

          <View style={styles.rowGap}>
            <Switch value={membershipDiscEnabled} onValueChange={setMembershipDiscEnabled} /><Text>Membership discount</Text>
          </View>
          <TextInput label="Discount (%)" value={membershipDiscPct.toString()} onChangeText={(v) => setMembershipDiscPct(Number(v)||0)} keyboardType="numeric" />
        </GlassCard>

        {/* Booking fees */}
        <GlassCard>
          <Text variant="titleSmall" style={styles.bold}>Booking fees</Text>
          <View style={styles.rowGap}>
            <Switch value={bookingFlatEnabled} onValueChange={setBookingFlatEnabled} /><Text>Flat</Text>
            <TextInput label="UGX" value={bookingFlat.toString()} onChangeText={(v) => setBookingFlat(Number(v)||0)} keyboardType="numeric" style={{ flex: 1 }} />
          </View>
          <View style={styles.rowGap}>
            <Switch value={bookingPctEnabled} onValueChange={setBookingPctEnabled} /><Text>Percent</Text>
            <TextInput label="%" value={bookingPct.toString()} onChangeText={(v) => setBookingPct(Number(v)||0)} keyboardType="numeric" style={{ flex: 1 }} />
          </View>
        </GlassCard>

        {/* Payment timing */}
        <GlassCard>
          <Text variant="titleSmall" style={styles.bold}>Payment timing</Text>
          <RadioButton.Group value={timing} onValueChange={(v) => setTiming(v as 'prepaid' | 'postpaid')}>
            <RadioButton.Item label="Pre-paid" value="prepaid" />
            <RadioButton.Item label="Post-paid" value="postpaid" />
          </RadioButton.Group>
        </GlassCard>

        <Button mode="contained" buttonColor="#f77f00" textColor="#fff" onPress={handleSave} style={styles.saveBtn}>
          Save pricing
        </Button>
      </ScrollView>

      <Snackbar visible={snack} onDismiss={() => setSnack(false)} duration={1500}>
        Pricing saved!
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
  cardInner: { padding: 12, backgroundColor: 'rgba(255,255,255,0.55)' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  rowCenterBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bold: { fontWeight: '800' },
  muted: { color: '#6b7280' },
  periodCard: { marginBottom: 8, borderRadius: 12 },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  dayChipOn: { backgroundColor: '#f77f00' },
  dayChipOff: { backgroundColor: '#f2f2f2' },
  spacer8: { height: 8 },
  saveBtn: { borderRadius: 999, marginTop: 12 },
});

/*
================ Usage tests (do not remove) ================
1) Default
<PricingFeesScreen />

2) With onSave
<PricingFeesScreen onSave={(p)=>console.log('saved',p)} />

Route integration (expo-router):
- Place this file at app/(tabs)/pricing.tsx so it mounts inside your existing Tabs layout.
- Bottom navigation is intentionally omitted in this screen per your request.
*/
