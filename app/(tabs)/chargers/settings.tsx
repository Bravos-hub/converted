// app/chargers/settings.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native parity for S06_ChargerSettings.jsx

import * as React from 'react';
import { router } from 'expo-router';
import { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { BlurView } from 'expo-blur';
import {
  Provider as PaperProvider,
  Appbar,
  Button,
  Card,
  Text,
  RadioButton,
  Menu,
  Snackbar,
  HelperText,
} from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// ---------- Types
type Charger = { id: string; name: string };
type Connector = { id: string; label: string };

type Props = {
  chargers?: Charger[];
  defaultChargerId?: string;
  onBack?: () => void;
  onHelp?: () => void;
  onNavChange?: (v: number) => void;
  openDevices?: (chargerId?: string, connectorId?: string) => void;
  openPricing?: (chargerId?: string, connectorId?: string) => void;
  openAccess?: (chargerId?: string, connectorId?: string) => void;
  openAvailability?: (chargerId?: string, connectorId?: string) => void;
  openChooseSite?: (chargerId?: string) => void;
  openAdvancedConfig?: (chargerId?: string, connectorId?: string) => void;
  openDiagnostics?: (chargerId?: string, connectorId?: string) => void;
  openHistory?: (chargerId?: string, connectorId?: string) => void;
  onOpenAggregator?: (chargerId?: string, connectorId?: string, scope?: string) => void;
};

// ---------- Sample connectors (typed)
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

// ---------- Menu tile
function MenuTile({
  icon,
  title,
  subtitle,
  onPress,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress?: () => void;
  cta?: React.ReactNode;
}) {
  return (
    <Card mode="outlined" style={styles.tile} onPress={onPress}>
      <Card.Content style={styles.rowCenter}>
        <View style={styles.iconWrap}>{icon}</View>
        <View style={{ flex: 1 }}>
          <Text variant="titleSmall" style={styles.bold}>{title}</Text>
          <Text variant="labelSmall" style={styles.muted}>{subtitle}</Text>
        </View>
        {cta ?? <MaterialIcons name="chevron-right" size={18} color="#555" />}
      </Card.Content>
    </Card>
  );
}

// ---------- Screen
export default function ChargerSettingsScreen({
  chargers = [
    { id: 'st1', name: 'Home Charger' },
    { id: 'st2', name: 'Office Charger' },
  ],
  defaultChargerId = 'st1',
  onBack,
  onHelp,
  onNavChange,
  openDevices,
  openPricing,
  openAccess,
  openAvailability,
  openChooseSite,
  openAdvancedConfig,
  openDiagnostics,
  openHistory,
  onOpenAggregator,
}: Props) {
  const [navValue, setNavValue] = useState(1);
  const [chargerId, setChargerId] = useState<string>(defaultChargerId);
  const [scope, setScope] = useState<'charger' | 'connector'>('charger');

  // ✅ connectors is now strongly typed
  const connectors: Connector[] = useMemo(
    () => CONNECTORS[chargerId] ?? [],
    [chargerId]
  );

  const [connectorId, setConnectorId] = useState<string>(connectors[0]?.id ?? '');
  React.useEffect(() => {
    // ✅ no TS error indexing CONNECTORS with string key
    setConnectorId((CONNECTORS[chargerId]?.[0]?.id) ?? '');
  }, [chargerId]);

  const [snack, setSnack] = useState(false);

  const pass = (fn?: Function) => () => {
    if (fn) fn(chargerId, scope === 'connector' ? connectorId : undefined);
    else setSnack(true);
  };

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <Appbar.Header style={styles.appbar}>
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="arrow-back-ios" />} onPress={() => (onBack ? onBack() : router.back())} />
        <Appbar.Content title="Charger settings" subtitle="quick actions hub" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="help-outline" />} onPress={() => onHelp?.()} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Target selectors */}
        <GlassCard>
          <Text variant="titleSmall" style={styles.bold}>Target</Text>
          <Text variant="labelSmall" style={styles.muted}>Select charger and scope</Text>

          {/* Charger selection anchor placeholder (swap for your picker) */}
          <View style={{ marginTop: 8 }}>
            <Menu
              visible={false}
              onDismiss={() => {}}
              anchor={
                <Button mode="outlined" onPress={() => {}}>
                  {chargers.find((c: Charger) => c.id === chargerId)?.name}
                </Button>
              }
            >
              <Menu.Item title="Placeholder" disabled />
            </Menu>
          </View>

          {/* Scope */}
          <View style={[styles.rowCenter, { marginTop: 12 }]}>
            <RadioButton.Group onValueChange={(v) => setScope(v as 'charger' | 'connector')} value={scope}>
              <View style={styles.rowCenter}>
                <RadioButton value="charger" />
                <Text>Charger</Text>
                <RadioButton value="connector" />
                <Text>Connector</Text>
              </View>
            </RadioButton.Group>
          </View>

          {/* Connector (if needed) */}
          {scope === 'connector' && (
            <View style={{ marginTop: 8 }}>
              <Text variant="labelSmall" style={styles.muted}>Connector</Text>
              {connectors.length ? (
                <Button mode="outlined" onPress={() => {}}>
                  {connectors.find((c: Connector) => c.id === connectorId)?.label ?? 'Select connector'}
                </Button>
              ) : (
                <HelperText type="info">No connectors found for this charger</HelperText>
              )}
            </View>
          )}
        </GlassCard>

        {/* Menu list */}
        <View style={{ marginTop: 8 }}>
          <MenuTile icon={<MaterialIcons name="request-quote" size={22} color="#000" />} title="Pricing & fees" subtitle="Set rates by charger or connector" onPress={pass(openPricing)} />
          <MenuTile icon={<MaterialIcons name="schedule" size={22} color="#000" />} title="Availability" subtitle="Hours & days (charger/connector)" onPress={pass(openAvailability)} />
          <MenuTile icon={<MaterialIcons name="lock-person" size={22} color="#000" />} title="Access & permissions" subtitle="Who can use (charger/connector)" onPress={pass(openAccess)} />
          <MenuTile icon={<MaterialIcons name="place" size={22} color="#000" />} title="Sites" subtitle="Select or add a location" onPress={pass(openChooseSite)} />
          <MenuTile icon={<MaterialCommunityIcons name="devices" size={22} color="#000" />} title="Other devices" subtitle="Link cards, meters & peripherals" onPress={pass(openDevices)} />
          <MenuTile icon={<MaterialIcons name="settings-ethernet" size={22} color="#000" />} title="Advanced configuration" subtitle="OCPP data & limits" onPress={pass(openAdvancedConfig)} />
          <MenuTile icon={<MaterialIcons name="history" size={22} color="#000" />} title="History" subtitle="Energy • duration • receipts" onPress={pass(openHistory)} />
          <MenuTile icon={<MaterialIcons name="bug-report" size={22} color="#000" />} title="Diagnostics & logs" subtitle="Faults and telemetry" onPress={pass(openDiagnostics)} />
          <MenuTile
            icon={<MaterialIcons name="launch" size={22} color="#f77f00" />}
            title="Aggregator & CPMS"
            subtitle="Manage tariffs & public listing"
            onPress={() => onOpenAggregator?.(chargerId, connectorId, scope)}
            cta={<MaterialIcons name="launch" size={18} color="#f77f00" />}
          />
        </View>
      </ScrollView>

      <Snackbar visible={snack} onDismiss={() => setSnack(false)} duration={1500}>
        Action triggered!
      </Snackbar>
    </PaperProvider>
  );
}

// ---------- Styles
const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  appbar: { backgroundColor: '#03cd8c' },
  appbarTitle: { fontWeight: '800' },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eef3f1',
    marginBottom: 8,
  },
  cardInner: { padding: 12, backgroundColor: 'rgba(255,255,255,0.55)' },
  tile: { borderRadius: 12, marginBottom: 8 },
  iconWrap: {
    width: 44, height: 44,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  bold: { fontWeight: '800' },
  muted: { color: '#6b7280' },
});
