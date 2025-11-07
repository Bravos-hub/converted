import * as React from 'react';
import { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Provider as PaperProvider,
  Appbar,
  Text,
  Chip,
  Button,
  IconButton,
  Divider,
  Switch,
  ProgressBar,
  Snackbar,
} from 'react-native-paper';
import { useColorTheme } from '../../../hooks/use-color-theme';
import { useChargingSessions } from '../../../hooks/use-charging-sessions';
import { chargers as seedChargers, getStatusTint } from '../../../constants/mock-data';

type ChargerState = typeof seedChargers;
type CommandState = Record<string, { unlocked: boolean }>;

function GlassCard({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardInner}>{children}</View>
    </View>
  );
}

export default function ChargersScreen() {
  const C = useColorTheme();
  const { activeSession, startSession, stopSession } = useChargingSessions();
  const [items, setItems] = useState<ChargerState>(seedChargers);
  const [snack, setSnack] = useState<string | null>(null);
  const [commandState, setCommandState] = useState<CommandState>(() =>
    Object.fromEntries(seedChargers.map(charger => [charger.id, { unlocked: false }]))
  );

  useEffect(() => {
    setCommandState(prev => {
      let changed = false;
      const next: CommandState = { ...prev };
      items.forEach(charger => {
        if (!next[charger.id]) {
          next[charger.id] = { unlocked: false };
          changed = true;
        }
      });
      Object.keys(next).forEach(id => {
        if (!items.some(charger => charger.id === id)) {
          delete next[id];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [items]);

  const onlineCount = useMemo(() => items.filter((c) => c.status === 'online' || c.status === 'busy').length, [items]);

  const toggleConnector = (chargerId: string, connectorId: string) => {
    setItems((prev) =>
      prev.map((charger) =>
        charger.id === chargerId
          ? {
              ...charger,
              connectors: charger.connectors.map((conn) =>
                conn.id === connectorId
                  ? {
                      ...conn,
                      enabled: !conn.enabled,
                      status: !conn.enabled ? 'available' : 'disabled',
                    }
                  : conn,
              ),
            }
          : charger,
      ),
    );
    setSnack(`Connector ${connectorId} toggled`);
  };

  const setTargetSoc = (chargerId: string, delta: number) => {
    setItems((prev) =>
      prev.map((charger) =>
        charger.id === chargerId
          ? { ...charger, targetSoc: Math.max(60, Math.min(95, charger.targetSoc + delta)) }
          : charger,
      ),
    );
    setSnack('Target SoC updated');
  };

  const handleAction = (charger: ChargerState[number], action: 'start' | 'stop') => {
    if (action === 'start') {
      const session = startSession({
        chargerId: charger.id,
        chargerName: charger.name,
        site: charger.location,
        driver: 'Operator',
        vehicle: 'Manual start',
        method: 'App',
        targetSoc: charger.targetSoc,
      });
      setSnack(`Session ${session.id} started on ${charger.name}`);
      return;
    }
    if (!activeSession || activeSession.chargerId !== charger.id) {
      setSnack(`No live session on ${charger.name}`);
      return;
    }
    const entry = stopSession();
    setSnack(entry ? `Stopped ${entry.id}` : `No live session on ${charger.name}`);
  };

  const toggleLock = (charger: ChargerState[number]) => {
    const chargerId = charger.id;
    const nextUnlocked = !(commandState[chargerId]?.unlocked ?? false);
    setCommandState(prev => {
      const current = prev[chargerId] ?? { unlocked: false };
      return {
        ...prev,
        [chargerId]: { ...current, unlocked: nextUnlocked },
      };
    });
    setSnack(`${nextUnlocked ? 'Unlock' : 'Lock'} sent to ${charger.name}`);
  };

  const CommandButton = ({
    icon,
    label,
    onPress,
    selected,
    disabled,
  }: {
    icon: string;
    label: string;
    onPress: () => void;
    selected?: boolean;
    disabled?: boolean;
  }) => (
    <Button
      mode={selected ? 'contained' : 'outlined'}
      icon={icon}
      onPress={onPress}
      style={styles.commandBtn}
      buttonColor={selected ? C.secondary : undefined}
      textColor="#111111"
      disabled={disabled}
    >
      {label}
    </Button>
  );

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.root}>
        <Appbar.Header style={{ backgroundColor: C.primary }}>
          <Appbar.Content title="Chargers" titleStyle={styles.bold} subtitle={`${onlineCount}/${items.length} active`} />
          <Appbar.Action icon="calendar-clock" onPress={() => router.push('/(tabs)/chargers/availability')} />
        </Appbar.Header>

        <ScrollView contentContainerStyle={styles.list}>
        <GlassCard>
          <View style={styles.rowBetween}>
            <View>
              <Text style={[styles.bold, { fontSize: 18 }]}>Add / connect charger</Text>
              <Text style={{ color: C.muted }}>Scan QR or enter serial to onboard instantly.</Text>
            </View>
            <Chip icon="qrcode-scan" onPress={() => router.push('/(tabs)/chargers/connect')}>
              QR scan
            </Chip>
          </View>
          <View style={styles.rowGap}>
            <Button mode="contained" icon="qrcode-scan" buttonColor={C.primary} textColor={C.onPrimary} onPress={() => router.push('/(tabs)/chargers/connect')}>
              Scan QR
            </Button>
            <Button mode="outlined" icon="pencil" onPress={() => router.push('/(tabs)/chargers/add')}>
              Manual entry
            </Button>
          </View>
        </GlassCard>

        {items.map((charger) => {
          const status = getStatusTint(charger.status);
          const controlState = commandState[charger.id] ?? { unlocked: false };
          const isActiveHere = activeSession?.chargerId === charger.id;
          return (
            <GlassCard key={charger.id}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={[styles.bold, { fontSize: 16 }]}>{charger.name}</Text>
                  <Text style={{ color: C.muted }}>
                    {charger.location} • {charger.id}
                  </Text>
                </View>
                <Chip style={{ backgroundColor: status.bg }} textStyle={{ color: status.fg }}>
                  {charger.status}
                </Chip>
              </View>

              <View style={styles.rowBetween}>
                <Chip icon="briefcase" compact>
                  {charger.isCommercial ? 'Commercial' : 'Private'}
                </Chip>
                <Text style={{ color: C.muted }}>Last: {charger.lastSession}</Text>
              </View>

              <ProgressBar progress={charger.avgUtilization / 100} color={C.secondary} style={{ marginTop: 8 }} />
              <Text style={{ fontSize: 12, color: C.muted }}>Utilization {charger.avgUtilization}%</Text>

              <Divider style={styles.divider} />

              <View style={styles.commandRow}>
                <CommandButton
                  icon="play"
                  label="Start"
                  selected={isActiveHere}
                  onPress={() => handleAction(charger, 'start')}
                />
                <CommandButton
                  icon="stop"
                  label="Stop"
                  disabled={!isActiveHere}
                  onPress={() => handleAction(charger, 'stop')}
                />
              </View>
              <View style={styles.singleCommand}>
                <CommandButton
                  icon={controlState.unlocked ? 'lock' : 'lock-open'}
                  label={controlState.unlocked ? 'Lock' : 'Unlock'}
                  selected={controlState.unlocked}
                  onPress={() => toggleLock(charger)}
                />
              </View>

              <View style={styles.rowBetween}>
                <Text>Target SoC</Text>
                <View style={styles.rowGap}>
                  <IconButton icon="minus-circle-outline" size={20} onPress={() => setTargetSoc(charger.id, -5)} />
                  <Text style={styles.bold}>{charger.targetSoc}%</Text>
                  <IconButton icon="plus-circle-outline" size={20} onPress={() => setTargetSoc(charger.id, 5)} />
                </View>
              </View>

              <Divider style={styles.divider} />

              <Text style={[styles.bold, { marginBottom: 6 }]}>Connector management</Text>
              {charger.connectors.map((connector) => (
                <View key={connector.id} style={styles.connectorRow}>
                  <View>
                    <Text style={styles.bold}>
                      {connector.format} • {connector.powerKw} kW
                    </Text>
                    <Text style={{ color: C.muted }}>Status: {connector.status}</Text>
                  </View>
                  <View style={styles.rowGap}>
                    <Text style={{ color: C.muted }}>Enable</Text>
                    <Switch value={connector.enabled} onValueChange={() => toggleConnector(charger.id, connector.id)} />
                  </View>
                </View>
              ))}

              <Divider style={styles.divider} />

              <Text style={[styles.bold, { marginBottom: 4 }]}>Pricing</Text>
              {charger.pricing.map((price) => (
                <View key={price.label} style={styles.rowBetween}>
                  <Text>{price.label}</Text>
                  <Text style={styles.bold}>
                    {price.rate}
                    {price.window ? ` • ${price.window}` : ''}
                  </Text>
                </View>
              ))}

              <Divider style={styles.divider} />
              <Text style={[styles.bold, { marginBottom: 4 }]}>Availability</Text>
              <View style={styles.chipWrap}>
                {charger.availability.map((slot) => (
                  <Chip key={slot.label} icon="calendar-range" mode="outlined" style={styles.availabilityChip}>
                    {slot.label}: {slot.window}
                  </Chip>
                ))}
              </View>

              {charger.alerts?.map((alert) => (
                <Chip key={alert.message} icon="alert" style={{ marginTop: 6 }} textStyle={{ color: C.error }}>
                  {alert.message}
                </Chip>
              ))}
            </GlassCard>
          );
        })}
        </ScrollView>
      </View>

      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={1500}>
        {snack}
      </Snackbar>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f2f2f2' },
  list: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#f2f2f2',
  },
  bold: { fontWeight: '800' },
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  cardInner: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e7ebea',
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  commandRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  singleCommand: { flexDirection: 'row' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  divider: { marginVertical: 10 },
  connectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  commandBtn: { flex: 1 },
  availabilityChip: { marginRight: 6, marginBottom: 6 },
});
