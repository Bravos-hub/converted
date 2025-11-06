// app/sessions/history.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native parity for ChargingHistory (MUI → React Native Paper)
// - Bottom tabs are handled by your tabs layout; this screen omits BottomNavigation
//
// Dependencies:
//   expo install expo-blur
//   npm i react-native-paper @expo/vector-icons

import * as React from 'react';
import { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { BlurView } from 'expo-blur';
import {
  Provider as PaperProvider,
  Appbar,
  Button,
  Chip,
  Text,
  Card,
  TextInput,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorTheme } from '../../../hooks/use-color-theme';

// ===== Types =====
export type Charger = { id: string; name: string };
export type Session = {
  id: string;
  date: string; // YYYY-MM-DD
  site: string;
  kwh: number;
  duration: string; // HH:MM
  amount: number; // minor currency units
  type: 'public' | 'private';
};

export type Props = {
  chargers?: Charger[];
  defaultChargerId?: string;
  commercialChargerId?: string;
  selectedChargerId?: string;
  aggregatorUrl?: string;
  onOpenAggregator?: (url?: string) => void;
  onBack?: () => void;
  onHelp?: () => void;
  onOpenReceipt?: (s: Session) => void;
};

// ===== Glassy container =====
function GlassCard({ children, style }: { children: React.ReactNode; style?: any }) {
  const C = useColorTheme();
  return (
    <BlurView intensity={30} tint="light" style={[styles.card, { borderColor: C.border }, style]}> 
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

// ===== Row =====
function Row({ s, onOpenReceipt }: { s: Session; onOpenReceipt?: (s: Session) => void }) {
  const C = useColorTheme();
  return (
    <Card mode="outlined" style={{ marginBottom: 8, borderRadius: 12 }}>
      <Card.Content>
        <View style={styles.rowCenterBetween}>
          <View style={{ flex: 1 }}>
            <Text variant="titleSmall" style={styles.bold}>{s.date} — {s.site}</Text>
            <Text variant="labelSmall" style={[styles.muted, { color: C.muted }]}>{s.kwh} kWh • {s.duration} • UGX {s.amount.toLocaleString()}</Text>
          </View>
          <Button mode="text" onPress={() => onOpenReceipt?.(s)}>Receipt</Button>
        </View>
      </Card.Content>
    </Card>
  );
}

// ===== Screen =====
export default function ChargingHistoryScreen({
  chargers = [{ id: 'st1', name: 'Home Charger' }, { id: 'st2', name: 'Office Charger' }],
  defaultChargerId = 'st1',
  commercialChargerId,
  selectedChargerId,
  aggregatorUrl,
  onOpenAggregator,
  onBack,
  onHelp,
  onOpenReceipt,
}: Props) {
  const [chargerId, setChargerId] = useState(selectedChargerId || defaultChargerId);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'all' | 'public' | 'private'>('all');

  const isCommercial = !!(chargerId && commercialChargerId && chargerId === commercialChargerId);

  const data = useMemo<Session[]>(() => ([
    { id: 's1', date: '2025-10-18', site: 'Home Charger', kwh: 12.4, duration: '01:32', amount: 14880, type: 'public' },
    { id: 's2', date: '2025-10-12', site: 'Home Charger', kwh: 6.1, duration: '00:45', amount: 6120, type: 'private' },
  ]), []);

  const filtered = data.filter(s => (
    (mode === 'all' || s.type === mode) &&
    (query.trim() === '' || s.site.toLowerCase().includes(query.toLowerCase()))
  ));

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Appbar */}
      <Appbar.Header style={[styles.appbar, { backgroundColor: useColorTheme().primary }]}>
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="arrow-back-ios" />} onPress={() => router.back()} />
        <Appbar.Content title="Charging history" subtitle="sessions • energy • receipts" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="help-outline" />} onPress={() => onHelp?.()} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Charger selector */}
        <GlassCard>
          <Text variant="titleSmall" style={styles.bold}>My chargers</Text>
          <Text variant="labelSmall" style={[styles.muted, { color: useColorTheme().muted }]}>Select a charger</Text>
          {/* Replace with your own picker; using a simple cycle button for stub */}
          <Button mode="outlined" onPress={() => {
            const idx = chargers.findIndex(c => c.id === chargerId);
            const next = chargers[(idx + 1) % chargers.length];
            setChargerId(next.id);
          }}>
            {chargers.find(c => c.id === chargerId)?.name}
          </Button>
        </GlassCard>

        {/* Commercial badge + Aggregator CTA */}
        <View style={[styles.rowCenter, { marginBottom: 8 }]}> 
          <CommercialBadge isCommercial={isCommercial} />
          {!isCommercial && (
            <Button mode="text" onPress={() => onOpenAggregator?.(aggregatorUrl)} textColor={useColorTheme().secondary} style={{ marginLeft: 8 }}>Aggregator & CPMS</Button>
          )}
        </View>

        {/* Filters */}
        <GlassCard>
          <TextInput
            label="Search"
            value={query}
            onChangeText={setQuery}
            left={<TextInput.Icon icon="magnify" />}
            style={{ marginBottom: 8 }}
          />
          <View style={styles.rowGap}>
            <Chip compact selected={mode === 'all'} onPress={() => setMode('all')}>All</Chip>
            <Chip compact selected={mode === 'public'} onPress={() => setMode('public')} disabled={!isCommercial}>Public</Chip>
            <Chip compact selected={mode === 'private'} onPress={() => setMode('private')}>Private</Chip>
          </View>
        </GlassCard>

        {/* List */}
        {filtered.map((s) => (
          <Row key={s.id} s={s} onOpenReceipt={onOpenReceipt} />
        ))}

        {!filtered.length && (
          <GlassCard>
            <Text variant="labelSmall" style={[styles.muted, { color: useColorTheme().muted }]}>No results for the selected filters.</Text>
          </GlassCard>
        )}
      </ScrollView>
    </PaperProvider>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 24 },
  appbar: {},
  appbarTitle: { fontWeight: '800' },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    // themed via component
    marginBottom: 12,
  },
  cardInner: { padding: 12, backgroundColor: 'rgba(255,255,255,0.55)' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  rowCenterBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bold: { fontWeight: '800' },
  muted: {},
  badgeOn: {},
});

/*
================ Usage tests (do not remove) ================
1) Default
<ChargingHistoryScreen />

2) With receipt open handler
<ChargingHistoryScreen onOpenReceipt={(s)=>console.log('open receipt', s)} />

Route integration (expo-router):
- Place at app/sessions/history.tsx so it mounts inside your Tabs layout.
- Bottom navigation is intentionally omitted here.
*/
