import * as React from 'react';
import { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Provider as PaperProvider,
  Appbar,
  Text,
  Button,
  Chip,
  Divider,
  SegmentedButtons,
  List,
  TextInput,
  Snackbar,
} from 'react-native-paper';
import { useColorTheme } from '../../../hooks/use-color-theme';
import { useChargingSessions } from '../../../hooks/use-charging-sessions';
import {
  sessionAnalytics,
  sessionFilters,
  upcomingReservations,
} from '../../../constants/mock-data';

export default function SessionsScreen() {
  const C = useColorTheme();
  const { activeSession, history, startSession, stopSession } = useChargingSessions();
  const [filter, setFilter] = useState<(typeof sessionFilters)[number]>(sessionFilters[0]);
  const [sessionCode, setSessionCode] = useState('');
  const [snack, setSnack] = useState<string | null>(null);

  const filteredHistory = useMemo(() => {
    if (filter === '7d') return history;
    if (filter === '30d') return history.slice(0, 4);
    return history.slice(0, 3);
  }, [filter, history]);

  const startManualSession = () => {
    const trimmed = sessionCode.trim();
    if (!trimmed) {
      setSnack('Enter charger ID or QR code');
      return;
    }
    const session = startSession({
      chargerId: trimmed,
      chargerName: trimmed,
      site: 'Manual start',
      driver: 'Manual override',
      method: 'App',
    });
    setSnack(`Session ${session.id} started`);
    setSessionCode('');
  };

  const handleStop = () => {
    if (!activeSession) {
      setSnack('No live session to stop');
      return;
    }
    const entry = stopSession();
    setSnack(entry ? `Stopped ${entry.id}` : 'No live session to stop');
  };

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <Appbar.Header style={{ backgroundColor: C.primary }}>
        <Appbar.Content title="Sessions" titleStyle={styles.bold} subtitle="Start • monitor • settle" />
        <Appbar.Action icon="calendar" onPress={() => router.push('/(tabs)/sessions/bookings')} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Start flow */}
        <View style={styles.card}>
          <Text style={[styles.bold, styles.cardTitle]}>Start session</Text>
          <TextInput
            mode="outlined"
            label="Charger ID / reservation code"
            value={sessionCode}
            onChangeText={setSessionCode}
            right={<TextInput.Icon icon="qrcode-scan" onPress={() => router.push('/(tabs)/sessions/start')} />}
          />
          <View style={styles.rowGap}>
            <Button mode="contained" icon="play" onPress={startManualSession} style={styles.flexBtn}>
              Start
            </Button>
            <Button mode="outlined" icon="qrcode-scan" onPress={() => router.push('/(tabs)/sessions/start')} style={styles.flexBtn}>
              Scan QR
            </Button>
          </View>
        </View>

        {/* Live session */}
        <View style={styles.card}>
          {activeSession ? (
            <>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.bold}>{activeSession.vehicle}</Text>
                  <Text style={{ color: C.muted }}>{activeSession.site}</Text>
                </View>
                <Chip icon="flash" style={{ backgroundColor: C.secondary }} textStyle={{ color: C.onSecondary }}>
                  {activeSession.status}
                </Chip>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.metricRow}>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>Energy</Text>
                  <Text style={styles.metricValue}>{activeSession.kwh.toFixed(1)} kWh</Text>
                </View>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>Power</Text>
                  <Text style={styles.metricValue}>{activeSession.powerKw} kW</Text>
                </View>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>Cost</Text>
                  <Text style={styles.metricValue}>
                    {activeSession.currency} {activeSession.cost.toLocaleString()}
                  </Text>
                </View>
              </View>
              <View style={styles.rowGap}>
                <Button mode="outlined" icon="stop" onPress={handleStop}>
                  Stop
                </Button>
                <Button mode="outlined" icon="lock-open-outline" onPress={() => setSnack('Unlock sent')}>
                  Unlock
                </Button>
              </View>
            </>
          ) : (
            <View style={styles.emptyLive}>
              <Text style={styles.bold}>No live session</Text>
              <Text style={{ color: C.muted, textAlign: 'center' }}>
                Start a charging session to see live metrics here.
              </Text>
              <Button mode="contained" icon="play" onPress={() => router.push('/(tabs)/sessions/start')}>
                Start session
              </Button>
            </View>
          )}
        </View>

        {/* Analytics */}
        <View style={styles.card}>
          <Text style={[styles.bold, styles.cardTitle]}>Analytics</Text>
          <View style={styles.rowGapWrap}>
            {sessionAnalytics.map((item) => (
              <View key={item.id} style={styles.analyticsCard}>
                <Text style={{ color: C.muted }}>{item.label}</Text>
                <Text style={[styles.bold, { fontSize: 18 }]}>{item.value}</Text>
                <Chip compact icon={item.change.startsWith('+') ? 'arrow-up' : 'arrow-down'} style={styles.analyticsChip}>
                  {item.change}
                </Chip>
              </View>
            ))}
          </View>
        </View>

        {/* History */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={[styles.bold, styles.cardTitle]}>Session history</Text>
            <SegmentedButtons
              value={filter}
              onValueChange={(v) => setFilter(v as typeof filter)}
              buttons={sessionFilters.map((tag) => ({ value: tag, label: tag }))}
            />
          </View>
          <Divider style={styles.divider} />
          {filteredHistory.map((item) => (
            <List.Item
              key={item.id}
              title={`${item.driver} • ${item.energy} kWh`}
              description={`${item.started} • ${item.cost.toLocaleString()} UGX`}
              left={(props) => <List.Icon {...props} icon={item.method === 'QR' ? 'qrcode' : item.method === 'RFID' ? 'radio-handheld' : 'cellphone'} />}
              right={() => (
                <Chip
                  compact
                  style={[
                    styles.statusChip,
                    { backgroundColor: item.status === 'completed' ? '#DCFCE7' : item.status === 'failed' ? '#fee2e2' : '#fde68a' },
                  ]}
                >
                  {item.status}
                </Chip>
              )}
              onPress={() => router.push('/(tabs)/sessions/summary')}
            />
          ))}
        </View>

        {/* Reservations */}
        <View style={styles.card}>
          <Text style={[styles.bold, styles.cardTitle]}>Upcoming reservations</Text>
          {upcomingReservations.map((res) => (
            <List.Item
              key={res.id}
              title={`${res.driver} • ${res.site}`}
              description={res.window}
              right={() => (
                <Chip mode="outlined" icon={res.status === 'approved' ? 'check' : 'timer-sand'}>
                  {res.status}
                </Chip>
              )}
              onPress={() => router.push('/(tabs)/sessions/bookings')}
            />
          ))}
          <Button mode="text" onPress={() => router.push('/(tabs)/sessions/bookings')} icon="calendar-month">
            Manage reservations
          </Button>
        </View>

        {/* Summary */}
        <View style={styles.card}>
          <Text style={[styles.bold, styles.cardTitle]}>Latest receipt</Text>
          <Text>Session SES-2101 • UGX 18,600</Text>
          <Button mode="outlined" icon="receipt" onPress={() => router.push('/(tabs)/sessions/summary')}>
            View summary
          </Button>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={1600}>
        {snack}
      </Snackbar>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eef3f1',
  },
  cardTitle: { fontSize: 16, marginBottom: 8 },
  bold: { fontWeight: '800' },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  rowGapWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  flexBtn: { flex: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  divider: { marginVertical: 12 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  metricCol: { flex: 1 },
  emptyLive: { alignItems: 'center', gap: 8 },
  metricLabel: { color: '#6b7280' },
  metricValue: { fontWeight: '700', marginTop: 4 },
  analyticsCard: {
    flexBasis: '30%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
  analyticsChip: { alignSelf: 'flex-start', marginTop: 6 },
  statusChip: { alignSelf: 'center' },
});
