// app/(tabs)/dashboard.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Visual + functional parity with the existing React/MUI dashboard, but native.
// - Uses react-native-paper for Material-like UI
// - Uses expo-blur for glassy cards
// - Uses react-native-svg for sparklines
// - Bottom navigation is omitted (handled by your tabs layout)
//
// Dependencies (install in your Expo project):
//   expo install react-native-svg expo-blur
//   npm i react-native-paper @expo/vector-icons
//
// Optional (if you prefer a native dropdown):
//   npm i @react-native-picker/picker

import * as React from 'react';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { BlurView } from 'expo-blur';
import {
  Provider as PaperProvider,
  Appbar,
  Button,
  Chip,
  Dialog,
  Portal,
  Text,
  Snackbar,
  Menu,
  TextInput,
  ActivityIndicator,
  Card
} from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorTheme } from '../../../hooks/use-color-theme';
import Svg, { Path } from 'react-native-svg';

// ===== Types =====
export type Charger = { id: string; name: string };
export type LiveSession = { chargerId: string; powerKW: number; kwh: number; elapsedSec: number };
export type Alerts = { faults: number; offline: number };
export type PriceSummary = { rate: number; unit: string; publicHours: string };
export type Money = { balance: number; currency: string };
export type Invoice = { amount: number; currency: string };

export type Props = {
  // Data
  chargers?: Charger[];
  commercialChargerId?: string;
  selectedChargerId?: string;
  liveSession?: LiveSession;
  todayBookings?: number;
  alerts?: Alerts;
  priceSummary?: PriceSummary;
  wallet?: Money;
  lastInvoice?: Invoice;
  energyTrend?: number[];
  sessionsTrend?: number[];
  revenueTrend?: number[];
  errorMessage?: string;
  loading?: boolean;
  aggregatorUrl?: string;

  // Navigation handlers / actions
  onBack?: () => void;
  onHelp?: () => void;
  onNavChange?: (v: number) => void; // kept for parity, not used in this screen
  openStartQR?: (chargerId?: string) => void;
  openActions?: (chargerId?: string) => void;
  openBookings?: (chargerId?: string) => void;
  openCalendar?: (chargerId?: string) => void;
  openDiagnostics?: (chargerId?: string) => void;
  openPricing?: (chargerId?: string) => void;
  openAvailability?: (chargerId?: string) => void;
  openWallet?: () => void;
  openInvoices?: (chargerId?: string) => void;
  openHistory?: () => void;
  openSiteEditor?: (chargerId?: string) => void;
  openAccess?: (chargerId?: string) => void;
  openConnectorMgmt?: (chargerId?: string) => void;
  openSupport?: () => void;
  openEnergyAnalytics?: () => void;
  openCO2?: () => void;
  onRefresh?: (chargerId?: string) => void;
  onAddCharger?: (payload: { name: string; id: string; photo?: any }) => void;
  onStartOnboarding?: (payload: { name: string; id: string; photo?: any; previewUrl?: string }) => void;

  // Commercial switching
  onRequestCommercial?: (chargerId?: string) => void;
  onConfirmSwitchCommercial?: (p: { oldId?: string; newId?: string }) => void;
  onOpenAggregator?: (url?: string) => void;
  onCheckActivePublicSessions?: (oldId?: string) => Promise<boolean> | boolean;
};

// ===== Sparkline (SVG) =====
function Sparkline({ data = [], stroke = '#03cd8c', fill = 'rgba(3,205,140,.18)' }: { data?: number[]; stroke?: string; fill?: string }) {
  const W = 100, H = 36, P = 4;
  if (!data.length) return null;
  const max = Math.max(...data);
  const step = (W - P * 2) / (data.length - 1);
  const x = (i: number) => P + i * step;
  const y = (v: number) => H - P - (v / (max || 1)) * (H - P * 2);
  const points = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ');
  const area = `${points} L ${x(data.length - 1)} ${H - P} L ${x(0)} ${H - P} Z`;

  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Path d={area} fill={fill} />
      <Path d={points} fill="none" stroke={stroke} strokeWidth={2} />
    </Svg>
  );
}

// ===== Glassy card =====
function GlassCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  // Keep the glassy visual; drop the ad-hoc onLayout animation to satisfy TS strictness
  const C = useColorTheme();
  return (
    <BlurView intensity={30} tint="light" style={[styles.card, { borderColor: C.border }]}> 
      <View style={styles.cardInner}>{children}</View>
    </BlurView>
  );
}

// ===== Badge =====
function CommercialBadge({ isCommercial }: { isCommercial: boolean }) {
  const C = useColorTheme();
  return (
    <Chip compact selected={isCommercial} style={isCommercial ? [styles.badgeOn, { backgroundColor: C.secondary }] : undefined}>
      {isCommercial ? 'Commercial Charger' : 'Not commercial'}
    </Chip>
  );
}

// ===== Modals =====
function SwitchCommercialModal({
  visible,
  onDismiss,
  oldId,
  newId,
  aggregatorUrl,
  onConfirmSwitchCommercial,
  onOpenAggregator,
  onCheckActivePublicSessions
}: {
  visible: boolean;
  onDismiss: () => void;
  oldId?: string;
  newId?: string;
  aggregatorUrl?: string;
  onConfirmSwitchCommercial?: (p: { oldId?: string; newId?: string }) => void;
  onOpenAggregator?: (url?: string) => void;
  onCheckActivePublicSessions?: (oldId?: string) => Promise<boolean> | boolean;
}) {
  const C = useColorTheme();
  const [checking, setChecking] = useState(false);
  const confirm = async () => {
    if (onCheckActivePublicSessions) {
      setChecking(true);
      const hasActive = await onCheckActivePublicSessions(oldId);
      setChecking(false);
      if (hasActive) return; // silently block as in web version
    }
    onConfirmSwitchCommercial?.({ oldId, newId });
    onDismiss();
  };
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Switch Commercial Charger?</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.body}>You can have only one Commercial Charger. Switching will:</Text>
          <Text>
            {'\u2022'} Move public listing to the new charger{"\n"}
            {'\u2022'} Disable future bookings on the old charger{"\n"}
            {'\u2022'} Require no active public session on the old charger{"\n"}
            </Text>
          <Text style={styles.caption}>Need more than one? Manage unlimited commercial stations with EVzone Aggregator & CPMS.</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button onPress={() => onOpenAggregator?.(aggregatorUrl)}>Open Aggregator</Button>
          <Button mode="contained" buttonColor={C.secondary} textColor={C.onSecondary} disabled={checking} onPress={confirm}>
            {checking ? 'Checking…' : 'Confirm switch'}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

// ===== Screen =====
export default function DashboardScreen({
  chargers = [{ id: 'st1', name: 'Home Charger' }, { id: 'st2', name: 'Office Charger' }],
  commercialChargerId,
  selectedChargerId: selectedId,
  liveSession,
  todayBookings = 0,
  alerts = { faults: 0, offline: 0 },
  priceSummary = { rate: 1200, unit: 'UGX/kWh', publicHours: '09:00–18:00' },
  wallet = { balance: 180000, currency: 'UGX' },
  lastInvoice = { amount: 14880, currency: 'UGX' },
  energyTrend = [4, 6, 5, 7, 8, 6, 9],
  sessionsTrend = [1, 2, 1, 2, 3, 2, 3],
  revenueTrend = [9, 11, 10, 12, 13, 12, 15],
  errorMessage,
  loading = false,
  aggregatorUrl = 'https://aggregator.evzone.app',
  onBack,
  onHelp,
  onNavChange,
  openStartQR,
  openActions,
  openBookings,
  openCalendar,
  openDiagnostics,
  openPricing,
  openAvailability,
  openWallet,
  openInvoices,
  openHistory,
  openSiteEditor,
  openAccess,
  openConnectorMgmt,
  openSupport,
  openEnergyAnalytics,
  openCO2,
  onRefresh,
  onAddCharger,
  onStartOnboarding,
  onRequestCommercial,
  onConfirmSwitchCommercial,
  onOpenAggregator,
  onCheckActivePublicSessions
}: Props) {
  const C = useColorTheme();
  const [switchOpen, setSwitchOpen] = useState(false);
  const [selectedChargerId] = useState<string>(selectedId || (chargers[0] && chargers[0].id));
  const [snack, setSnack] = useState(false);
  const [moreVisible, setMoreVisible] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<{ name: string; id: string; photo: any; preview?: string }>({ name: '', id: '', photo: null });

  const isCommercial = !!(selectedChargerId && commercialChargerId && selectedChargerId === commercialChargerId);
  const selectedName = useMemo(() => (chargers.find(c => c.id === selectedChargerId)?.name || '—'), [chargers, selectedChargerId]);

  // KPI strip
  const KPIs = [
    { label: 'Energy (kWh)', value: (energyTrend.reduce((a, b) => a + b, 0)).toFixed(0), trend: energyTrend, color: C.primary },
    { label: 'Sessions', value: sessionsTrend.reduce((a, b) => a + b, 0).toString(), trend: sessionsTrend, color: '#8bc34a' },
    { label: 'Revenue', value: `${wallet.currency} ${(revenueTrend.reduce((a, b) => a + b, 0) * 1000).toLocaleString()}`, trend: revenueTrend, color: C.secondary },
  ];

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Top Appbar */}
      <Appbar.Header style={[styles.appbar, { backgroundColor: C.primary }]}>
        <Appbar.Action icon={(props) => <MaterialIcons name="arrow-back-ios" {...props} />} onPress={() => (onBack ? onBack() : router.back())} />
        <Appbar.Content title="Dashboard" subtitle="glance • act • resolve" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon={(props) => <MaterialIcons name="notifications" {...props} />} onPress={() => onHelp ? onHelp() : openSupport?.()} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Header actions */}
        <View style={styles.headerGrid}>
          <Button mode="outlined" icon="refresh" onPress={() => { if (onRefresh) { onRefresh(selectedChargerId); } setSnack(true); }} style={styles.pill}>Refresh</Button>
          <Button mode="outlined" icon={() => <MaterialIcons name="add-circle-outline" size={18} />} onPress={() => setAddOpen(true)} style={styles.pill}>Add Charger</Button>
          <Menu
            visible={moreVisible}
            onDismiss={() => setMoreVisible(false)}
            anchor={<Button mode="outlined" icon={() => <MaterialIcons name="more-horiz" size={18} />} onPress={() => setMoreVisible(true)} style={styles.pill}>More</Button>}
          >
            <Menu.Item leadingIcon={(props) => <MaterialCommunityIcons name="headset" size={18} />} onPress={() => { setMoreVisible(false); openSupport?.(); }} title="Support" />
            <Menu.Item leadingIcon={(props) => <MaterialIcons name="launch" size={18} />} onPress={() => { setMoreVisible(false); onOpenAggregator?.(aggregatorUrl); }} title="Aggregator" />
            <Menu.Item leadingIcon={(props) => <MaterialIcons name="request-quote" size={18} />} onPress={() => { setMoreVisible(false); openPricing?.(selectedChargerId); }} title="Pricing" />
          </Menu>
          {!!errorMessage && (
            <Chip compact style={[styles.warnChip, { backgroundColor: C.warningBg }]}>{errorMessage}</Chip>
          )}
        </View>

        {/* Status */}
        <GlassCard>
          <View style={styles.rowCenter}> 
            <Text variant="titleSmall" style={styles.bold}>Commercial status</Text>
            <View style={{ marginLeft: 8 }} />
            <CommercialBadge isCommercial={isCommercial} />
            {!isCommercial && (
              <Button mode="outlined" style={[styles.pill, { marginLeft: 'auto' }]} onPress={() => { onRequestCommercial?.(selectedChargerId); setSwitchOpen(true); }}>Make this my Commercial Charger</Button>
            )}
          </View>
          {!isCommercial && (
            <Text variant="bodySmall" style={[styles.caption, { color: C.muted }]}>Only one Commercial Charger is allowed per account. Want more? <Text onPress={() => onOpenAggregator?.(aggregatorUrl)} style={[styles.link, { color: C.info }]}>Aggregator & CPMS</Text></Text>
          )}
          <View style={[styles.rowCenter, { marginTop: 8 }]}>
            <Text variant="bodySmall" style={styles.muted}>Selected:</Text>
            <Menu
              visible={false}
              onDismiss={() => {}}
              anchor={<Button mode="outlined" onPress={() => { /* replace with your own picker */ }}>{selectedName}</Button>}
            >
              <Menu.Item title="Select charger" disabled />
            </Menu>
          </View>
        </GlassCard>

        {/* KPIs */}
        <GlassCard>
          {loading ? (
            <View style={styles.rowCenter}><ActivityIndicator size={16} /><Text style={{ marginLeft: 8 }}>Loading…</Text></View>
          ) : (
            <View style={styles.kpiRow}>
              {KPIs.map((k, i) => (
                <View key={i} style={styles.kpiItem}>
                  <Text variant="labelSmall" style={[styles.muted, { color: C.muted }]}>{k.label}</Text>
                  <Text variant="titleSmall" style={styles.bold}>{k.value}</Text>
                  <Sparkline data={k.trend} stroke={k.color} fill="rgba(3,205,140,.18)" />
                </View>
              ))}
            </View>
          )}
        </GlassCard>

        {/* Live */}
        <GlassCard>
          <View style={styles.rowCenter}>
            <MaterialIcons name="bolt" size={20} color={liveSession ? C.secondary : '#bdbdbd'} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              {liveSession ? (
                <>
                  <Text variant="titleSmall" style={styles.bold}>Live session • {selectedName}</Text>
                  <Text variant="bodySmall" style={[styles.muted, { color: C.muted }]}>{liveSession.powerKW} kW • {liveSession.kwh} kWh • {Math.floor(liveSession.elapsedSec / 60)} min</Text>
                </>
              ) : (
                <>
                  <Text variant="titleSmall" style={styles.bold}>No live session</Text>
                  <Text variant="bodySmall" style={[styles.muted, { color: C.muted }]}>Start a session quickly by QR or open actions.</Text>
                </>
              )}
            </View>
            {liveSession ? (
              <Button mode="outlined" style={styles.pill} onPress={() => openActions?.(selectedChargerId)}>Control</Button>
            ) : (
              <View style={styles.rowCenterGap}>
                <Button mode="outlined" style={styles.pill} icon={() => <MaterialIcons name="qr-code-scanner" size={16} />} onPress={() => openStartQR?.(selectedChargerId)}>Start by QR</Button>
                <Button mode="outlined" style={styles.pill} onPress={() => openActions?.(selectedChargerId)}>Actions</Button>
              </View>
            )}
          </View>
        </GlassCard>

        {/* Bookings */}
        <GlassCard>
          <View style={styles.rowCenter}>
            <MaterialIcons name="calendar-month" size={20} />
            <Text variant="titleSmall" style={[styles.bold, { marginLeft: 8 }]}>Bookings today</Text>
            <Chip compact style={{ marginLeft: 'auto' }}>{todayBookings}</Chip>
          </View>
          {!isCommercial && (
            <Text variant="bodySmall" style={styles.caption}>Bookings are available only on your Commercial Charger.</Text>
          )}
          <View style={styles.rowCenterGap}>
            <Button mode="outlined" style={styles.pill} disabled={!isCommercial} onPress={() => openBookings?.(selectedChargerId)}>Manage</Button>
            <Button mode="outlined" style={styles.pill} onPress={() => openCalendar?.(selectedChargerId)}>Calendar</Button>
          </View>
        </GlassCard>

        {/* Alerts */}
        <GlassCard>
          <View style={styles.rowCenter}>
            <MaterialIcons name="bug-report" size={20} />
            <Text variant="titleSmall" style={[styles.bold, { marginLeft: 8 }]}>Health & alerts</Text>
            <Chip compact style={styles.warnChip}>Faults {alerts.faults}</Chip>
            <Chip compact style={{ marginLeft: 8 }}>Offline {alerts.offline}</Chip>
          </View>
          <Button mode="outlined" style={[styles.pill, { marginTop: 8 }]} onPress={() => openDiagnostics?.(selectedChargerId)}>Open diagnostics</Button>
        </GlassCard>

        {/* Prices */}
        <GlassCard>
          <View style={styles.rowCenter}>
            <MaterialIcons name="request-quote" size={20} />
            <Text variant="titleSmall" style={[styles.bold, { marginLeft: 8 }]}>Prices & availability</Text>
            <Chip compact style={{ marginLeft: 'auto' }}>{`${priceSummary.unit} ${priceSummary.rate.toLocaleString()}`}</Chip>
          </View>
          {isCommercial ? (
            <Text variant="bodySmall" style={[styles.muted, { color: C.muted }]}>Public hours: {priceSummary.publicHours}</Text>
          ) : (
            <Text variant="bodySmall" style={[styles.muted, { color: C.muted }]}>This charger is not commercial — public pricing won’t go live here.</Text>
          )}
          <View style={styles.rowCenterGap}>
            <Button mode="outlined" style={styles.pill} onPress={() => openPricing?.(selectedChargerId)}>Pricing</Button>
            <Button mode="outlined" style={styles.pill} onPress={() => openAvailability?.(selectedChargerId)}>Availability</Button>
          </View>
        </GlassCard>

        {/* Wallet */}
        <GlassCard>
          <View style={styles.rowCenter}>
            <MaterialIcons name="account-balance-wallet" size={20} color={C.secondary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text variant="titleSmall" style={styles.bold}>Wallet & invoices</Text>
              <Text variant="bodySmall" style={styles.muted}>Balance: {wallet.currency} {wallet.balance.toLocaleString()} • Last invoice: {lastInvoice.currency} {lastInvoice.amount.toLocaleString()}</Text>
            </View>
            <View style={styles.rowCenterGap}>
              <Button mode="outlined" style={styles.pill} onPress={() => openWallet?.()}>Wallet</Button>
              <Button mode="outlined" style={styles.pill} onPress={() => openInvoices?.(selectedChargerId)}>Invoices</Button>
            </View>
          </View>
        </GlassCard>

        {/* Quick grid */}
        <View style={styles.quickGrid}>
          {[
            { label: 'Start by QR', icon: <MaterialIcons name="qr-code-scanner" size={20} />, fn: openStartQR },
            { label: 'Actions', icon: <MaterialIcons name="settings-ethernet" size={20} />, fn: openActions },
            { label: 'Connectors', icon: <MaterialIcons name="settings-ethernet" size={20} />, fn: openConnectorMgmt },
            { label: 'Access', icon: <MaterialIcons name="lock-person" size={20} />, fn: openAccess },
            { label: 'Site', icon: <MaterialIcons name="place" size={20} />, fn: openSiteEditor },
            { label: 'Support', icon: <MaterialCommunityIcons name="headset" size={20} />, fn: openSupport },
            { label: 'Analytics', icon: <MaterialIcons name="trending-up" size={20} />, fn: openEnergyAnalytics },
            { label: 'CO₂', icon: <MaterialCommunityIcons name="tree" size={20} />, fn: openCO2 },
          ].map((t, i) => (
            <Card key={i} mode="elevated" style={styles.quickItem} onPress={() => t.fn?.(selectedChargerId)}>
              <Card.Content style={styles.quickContent}>
                {t.icon}
                <Text variant="labelSmall" numberOfLines={1}>{t.label}</Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Switch modal */}
      <SwitchCommercialModal
        visible={switchOpen}
        onDismiss={() => setSwitchOpen(false)}
        oldId={commercialChargerId}
        newId={selectedChargerId}
        aggregatorUrl={aggregatorUrl}
        onConfirmSwitchCommercial={onConfirmSwitchCommercial}
        onOpenAggregator={onOpenAggregator}
        onCheckActivePublicSessions={onCheckActivePublicSessions}
      />

      {/* Add charger modal (functional parity) */}
      <Portal>
        <Dialog visible={addOpen} onDismiss={() => setAddOpen(false)}>
          <Dialog.Title>Add charger</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Charger name" value={addForm.name} onChangeText={(v) => setAddForm(s => ({ ...s, name: v }))} style={{ marginBottom: 8 }} />
            <TextInput label="Charger ID / Serial" value={addForm.id} onChangeText={(v) => setAddForm(s => ({ ...s, id: v }))} style={{ marginBottom: 8 }} />
            {/* For photo capture/upload integrate expo-image-picker if needed */}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddOpen(false)}>Cancel</Button>
            <Button mode="contained" buttonColor={C.secondary} textColor={C.onSecondary} onPress={() => {
              if (onStartOnboarding) {
                onStartOnboarding({ name: addForm.name, id: addForm.id, photo: addForm.photo });
              } else if (onAddCharger) {
                onAddCharger({ name: addForm.name, id: addForm.id, photo: addForm.photo });
              }
              setAddOpen(false);
            }}>Continue → Setup</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Snackbar */}
      <Snackbar visible={snack} onDismiss={() => setSnack(false)} duration={1500}>Refreshed!</Snackbar>
    </PaperProvider>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  appbar: {},
  appbarTitle: { fontWeight: '800' },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    // themed via component
  },
  cardInner: { padding: 12, backgroundColor: 'rgba(255,255,255,0.55)' },
  badgeOn: {},
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  rowCenterGap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kpiRow: { flexDirection: 'row', justifyContent: 'space-between' },
  kpiItem: { width: '32%', alignItems: 'center' },
  pill: { borderRadius: 999 },
  warnChip: {},
  caption: { marginTop: 4 },
  muted: {},
  bold: { fontWeight: '800' },
  headerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  quickItem: { borderRadius: 999, width: '23%', height: 96 },
  quickContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  body: {},
  link: { textDecorationLine: 'underline' },
});

/*
================ Usage tests (do not remove) ================
1) Default
<DashboardScreen />

2) With commercial charger + live session
<DashboardScreen
  commercialChargerId="st2"
  selectedChargerId="st2"
  chargers={[{id:'st1',name:'Home'},{id:'st2',name:'Office'}]}
  liveSession={{ chargerId:'st2', powerKW: 7.2, kwh: 3.4, elapsedSec: 1260 }}
  todayBookings={3}
  alerts={{ faults: 1, offline: 0 }}
  priceSummary={{ rate: 1500, unit: 'UGX/kWh', publicHours: '08:00–20:00' }}
  wallet={{ balance: 250000, currency: 'UGX' }}
  lastInvoice={{ amount: 19800, currency: 'UGX' }}
/>

Route integration (expo-router):
- Place this file at app/(tabs)/dashboard.tsx so it mounts inside your existing Tabs layout.
- Bottom navigation is intentionally omitted in this screen per your request.
*/
