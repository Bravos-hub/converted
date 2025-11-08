// app/home/index.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native parity for S00_Home.jsx (mobile-first info splash + single CTA)
//
// UI stack:
// - react-native-paper (Appbar, Typography, Button, Card, Chip, Divider)
// - expo-blur (glassy cards)
// - @expo/vector-icons (Material icons)
//
// Install once:
//   expo install expo-blur
//   npm i react-native-paper @expo/vector-icons
//
// tsconfig.json should include:
//   { "compilerOptions": { "jsx":"react-jsx", "types":["react","react-native","expo","expo-router"] } }

import * as React from 'react';
import { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Provider as PaperProvider,
  Appbar,
  Button,
  Text,
  Chip,
  ProgressBar,
  Snackbar,
  IconButton,
  Divider,
} from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorTheme } from '../../../hooks/use-color-theme';
import { useChargingSessions } from '../../../hooks/use-charging-sessions';
import {
  accountProfile,
  chargers,
  dashboardKpis,
  healthAlerts,
} from '../../../constants/mock-data';
import { Sparkline } from '../../../components/ui/sparkline';

function GlassCard({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardInner}>{children}</View>
    </View>
  );
}

export default function HomeDashboard() {
  const C = useColorTheme();
  const { activeSession, startSession: startChargingSession, stopSession: stopChargingSession } = useChargingSessions();
  const [snack, setSnack] = useState<string | null>(null);
  const live = activeSession;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const base = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    return `${base}, ${accountProfile.name.split(' ')[0]}`;
  }, []);

  const offlineChargers = useMemo(() => chargers.filter((c) => c.status === 'offline' || c.status === 'fault'), []);
  const busyChargers = useMemo(() => chargers.filter((c) => c.status === 'busy'), []);

  const startDefaultSession = () => {
    if (!live) {
      router.push('/(tabs)/sessions/start');
      return;
    }
    const target = busyChargers[0] ?? chargers[0];
    if (!target) {
      setSnack('No charger available');
      return;
    }
    const session = startChargingSession({
      chargerId: target.id,
      chargerName: target.name,
      site: target.location,
      driver: accountProfile.name,
      vehicle: 'Fleet vehicle',
      method: 'App',
      targetSoc: target.targetSoc,
    });
    setSnack(`Session ${session.id} started on ${target.name}`);
  };

  const stopActiveSession = () => {
    if (!live) {
      setSnack('No live session to stop');
      return;
    }
    const entry = stopChargingSession();
    setSnack(entry ? `Stopped ${entry.id}` : 'No live session to stop');
  };

  const quickActions = [
    { label: live ? 'Start next session' : 'Start charging', icon: 'play-circle-outline', action: startDefaultSession },
    { label: 'Stop session', icon: 'stop-circle-outline', action: stopActiveSession },
    { label: 'Unlock connector', icon: 'lock-open-outline', action: () => setSnack('Connector unlocked') },
  ];

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.root}>
        <Appbar.Header style={{ backgroundColor: C.primary }}>
          <Appbar.Content title="Control tower" subtitle={greeting} titleStyle={styles.bold} />
          <Appbar.Action icon="bell-outline" onPress={() => setSnack('Notifications synced')} />
        </Appbar.Header>

        <ScrollView contentContainerStyle={styles.container}>
        {/* Live session */}
        <GlassCard>
          {live ? (
            <>
              <View style={styles.rowBetween}>
                <View>
                  <Text variant="titleMedium" style={styles.bold}>{live.vehicle}</Text>
                  <Text variant="labelSmall" style={{ color: C.muted }}>
                    {live.site} • {live.method} • target {live.targetSoc}%
                  </Text>
                </View>
                <Chip style={{ backgroundColor: C.secondary }} textStyle={{ color: C.onSecondary }}>
                  {live.status}
                </Chip>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>Energy</Text>
                  <Text style={[styles.metricValue, styles.bold]}>{live.kwh.toFixed(1)} kWh</Text>
                </View>
                <Divider style={styles.metricDivider} />
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>Power</Text>
                  <Text style={[styles.metricValue, styles.bold]}>{live.powerKw} kW</Text>
                </View>
                <Divider style={styles.metricDivider} />
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>Cost</Text>
                  <Text style={[styles.metricValue, styles.bold]}>
                    {live.currency} {live.cost.toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={styles.progressRow}>
                <Text variant="labelSmall" style={{ color: C.muted }}>
                  Session time • {live.durationMins} mins elapsed
                </Text>
                <Text variant="labelSmall" style={{ color: C.muted }}>
                  Target {live.targetSoc}%
                </Text>
              </View>
              <ProgressBar progress={Math.min(1, live.durationMins / 90)} color={C.secondary} />
            </>
          ) : (
            <View style={styles.emptyLive}>
              <Text style={styles.bold}>No live session</Text>
              <Text style={{ color: C.muted, textAlign: 'center' }}>Use quick actions to start a new charging session.</Text>
              <Button
                mode="contained"
                icon="play-circle"
                buttonColor={C.secondary}
                textColor={C.onSecondary}
                onPress={startDefaultSession}
              >
                Start charging
              </Button>
            </View>
          )}

          <View style={styles.actionsWrap}>
            {quickActions.map((qa) => (
              <Button
                key={qa.label}
                mode="outlined"
                icon={qa.icon}
                onPress={qa.action}
                style={styles.actionBtn}
              >
                {qa.label}
              </Button>
            ))}
          </View>
        </GlassCard>

        {/* KPIs */}
        <View>
          <Text variant="labelLarge" style={[styles.bold, { marginBottom: 8 }]}>
            KPIs (last 7 days)
          </Text>
          <View style={styles.kpiGrid}>
            {dashboardKpis.map((kpi) => (
              <GlassCard key={kpi.id} style={styles.kpiCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.muted}>{kpi.label}</Text>
                  <Chip compact style={{ backgroundColor: kpi.positive ? C.glassCardBg : C.warningBg }}>
                    {kpi.change}
                  </Chip>
                </View>
                <Text style={[styles.kpiValue, styles.bold]}>{kpi.value}</Text>
                <Sparkline data={kpi.data} color={C.secondary} />
              </GlassCard>
            ))}
          </View>
        </View>

        {/* Health alerts */}
        <View style={{ marginTop: 16 }}>
          <View style={styles.rowBetween}>
            <Text variant="labelLarge" style={styles.bold}>Health alerts</Text>
            <Chip icon="shield-alert" mode="outlined">
              {healthAlerts.length}
            </Chip>
          </View>
          {healthAlerts.map((alert, index) => (
            <GlassCard key={alert.id} style={{ marginTop: index === 0 ? 0 : 12 }}>
              <View style={styles.rowGap}>
                <MaterialCommunityIcons
                  name={
                    alert.severity === 'critical'
                      ? 'alert-octagram'
                      : alert.severity === 'warning'
                        ? 'alert-circle'
                        : 'information'
                  }
                  size={20}
                  color={
                    alert.severity === 'critical'
                      ? C.error
                      : alert.severity === 'warning'
                        ? C.warning
                        : C.info
                  }
                />
                <Text style={{ flex: 1 }}>{alert.message}</Text>
                <IconButton icon="chevron-right" size={18} onPress={() => setSnack('Open alert detail')} />
              </View>
            </GlassCard>
          ))}
        </View>

        {/* Charger status */}
        <GlassCard>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.bold}>Fleet health</Text>
              <Text style={{ color: C.muted }}>Commercial ready chargers</Text>
            </View>
            <Chip icon="briefcase-check" style={{ backgroundColor: C.primary }} textStyle={{ color: C.onPrimary }}>
              {chargers.filter((c) => c.isCommercial).length} / {chargers.length}
            </Chip>
          </View>

          <View style={styles.healthRow}>
            <View style={styles.healthCard}>
              <Text style={styles.healthNumber}>{busyChargers.length}</Text>
              <Text style={styles.muted}>Live</Text>
            </View>
            <View style={styles.healthCard}>
              <Text style={styles.healthNumber}>{offlineChargers.length}</Text>
              <Text style={styles.muted}>Offline / fault</Text>
            </View>
            <View style={styles.healthCard}>
              <Text style={styles.healthNumber}>{chargers.length - offlineChargers.length - busyChargers.length}</Text>
              <Text style={styles.muted}>Standby</Text>
            </View>
          </View>
        </GlassCard>

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>

      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={1800}>
        {snack}
      </Snackbar>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f2f2f2' },
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#f2f2f2',
    gap: 16,
  },
  bold: { fontWeight: '800' },
  muted: { color: '#6b7280' },
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  cardInner: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eef3f1',
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  metricCol: { flex: 1, alignItems: 'center' },
  metricLabel: { fontSize: 12, color: '#6b7280' },
  metricValue: { fontSize: 18 },
  metricDivider: { width: 1, height: 32, marginHorizontal: 16 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  emptyLive: { alignItems: 'center', gap: 8, paddingVertical: 16 },
  actionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  actionBtn: { flexGrow: 1, flexBasis: '48%' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  kpiCard: { flexBasis: '48%' },
  kpiValue: { fontSize: 20, marginBottom: 6 },
  healthRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  healthCard: { alignItems: 'center', flex: 1 },
  healthNumber: { fontSize: 24, fontWeight: '700' },
});
