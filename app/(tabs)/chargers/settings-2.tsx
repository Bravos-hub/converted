// app/chargers/settings.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native version of S12_ChargerSettings.jsx (MUI → React Native Paper)
// Bottom navigation removed (Tabs layout handles it)

import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Stack, router } from "expo-router";
import { BlurView } from "expo-blur";
import {
  Provider as PaperProvider,
  Appbar,
  Button,
  Text,
  Card,
  Chip,
  Divider,
  Menu,
  List,
} from "react-native-paper";
import {
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

type Charger = { id: string; name: string };

type Props = {
  chargers?: Charger[];
  defaultChargerId?: string;
  onBack?: () => void;
  onHelp?: () => void;
  onNavChange?: (v: number) => void;
  openDevices?: (id: string) => void;
  openPricing?: (id: string) => void;
  openAccess?: (id: string) => void;
  openAvailability?: (id: string) => void;
  openChooseSite?: (id: string) => void;
  openAdvancedConfig?: (id: string) => void;
  openDiagnostics?: (id: string) => void;
  openHistory?: (id: string) => void;
};

export default function ChargerSettingsScreen({
  chargers = [
    { id: "st1", name: "Home Charger" },
    { id: "st2", name: "Office Charger" },
  ],
  defaultChargerId = "st1",
  onBack,
  onHelp,
  openDevices,
  openPricing,
  openAccess,
  openAvailability,
  openChooseSite,
  openAdvancedConfig,
  openDiagnostics,
  openHistory,
}: Props) {
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [menuVisible, setMenuVisible] = useState(false);

  const go = (fn?: (id: string) => void, fallback?: string) => () =>
    fn ? fn(chargerId) : console.info(fallback);

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <Appbar.Header style={styles.appbar}>
        <Appbar.Action
          icon={(p) => <MaterialIcons {...p} name="arrow-back-ios" />}
          onPress={() => (onBack ? onBack() : router.back())}
        />
        <Appbar.Content
          title="Charger settings"
          subtitle="quick actions hub"
          titleStyle={styles.appbarTitle}
        />
        <Appbar.Action
          icon={(p) => <MaterialIcons {...p} name="help-outline" />}
          onPress={onHelp}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Charger Selector */}
        <BlurView intensity={30} tint="light" style={styles.card}>
          <View style={styles.cardInner}>
            <Text variant="titleSmall" style={styles.bold}>
              My chargers
            </Text>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setMenuVisible(true)}
                  style={{ marginTop: 6 }}
                >
                  {chargers.find((c) => c.id === chargerId)?.name}
                </Button>
              }
            >
              {chargers.map((c) => (
                <Menu.Item
                  key={c.id}
                  title={c.name}
                  onPress={() => {
                    setChargerId(c.id);
                    setMenuVisible(false);
                  }}
                />
              ))}
            </Menu>
          </View>
        </BlurView>

        {/* Menu Tiles */}
        <View style={{ gap: 10 }}>
          <MenuTile
            icon="devices"
            title="Other devices"
            subtitle="Link or manage peripherals"
            onPress={go(openDevices, "Navigate: Other devices")}
          />
          <MenuTile
            icon="currency-usd"
            title="Prices"
            subtitle="Set rates and fees"
            onPress={go(openPricing, "Navigate: 07 — Pricing & Fees")}
          />
          <MenuTile
            icon="lock"
            title="Access"
            subtitle="Grant users and methods"
            onPress={go(openAccess, "Navigate: 09 — Access & Permissions")}
          />
          <MenuTile
            icon="clock-outline"
            title="Availability"
            subtitle="Hours and days"
            onPress={go(openAvailability, "Navigate: 08 — Availability")}
          />
          <MenuTile
            icon="map-marker-outline"
            title="Sites"
            subtitle="Select or add a location"
            onPress={go(openChooseSite, "Navigate: 16 — Choose Site")}
          />
          <MenuTile
            icon="settings"
            title="Advanced configuration"
            subtitle="OCPP data & limits"
            onPress={go(openAdvancedConfig, "Navigate: 18 — Advanced Config")}
          />
          <MenuTile
            icon="history"
            title="History"
            subtitle="Energy • duration • receipts"
            onPress={go(openHistory, "Navigate: 19 — Charging History")}
          />
          <MenuTile
            icon="bug-outline"
            title="Diagnostics & logs"
            subtitle="View faults and telemetry"
            onPress={go(openDiagnostics, "Navigate: 21 — Diagnostics & Logs")}
          />
        </View>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <Button
            mode="contained"
            buttonColor="#f77f00"
            textColor="#fff"
            onPress={go(openPricing)}
            style={{ borderRadius: 999, flex: 1 }}
          >
            Open pricing
          </Button>
          <Button
            mode="outlined"
            onPress={go(openAvailability)}
            style={{ borderRadius: 999, flex: 1 }}
            textColor="#f77f00"
          >
            Open availability
          </Button>
        </View>
      </ScrollView>
    </PaperProvider>
  );
}

// ---------- Reusable Menu Tile ----------
function MenuTile({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Card
      mode="outlined"
      style={styles.menuCard}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Card.Content style={styles.row}>
        <MaterialCommunityIcons name={icon as any} size={26} color="#03cd8c" />
        <View style={{ flex: 1 }}>
          <Text variant="titleSmall" style={styles.bold}>
            {title}
          </Text>
          <Text variant="labelSmall" style={styles.muted}>
            {subtitle}
          </Text>
        </View>
        <MaterialIcons name="arrow-forward-ios" size={16} color="#aaa" />
      </Card.Content>
    </Card>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  appbar: { backgroundColor: "#03cd8c" },
  appbarTitle: { fontWeight: "800" },
  container: { padding: 16, paddingBottom: 60 },
  card: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#eef3f1",
    marginBottom: 12,
  },
  cardInner: { padding: 12, backgroundColor: "rgba(255,255,255,0.55)" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  bold: { fontWeight: "800" },
  muted: { color: "#6b7280" },
  menuCard: { borderRadius: 12 },
  footer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
    marginBottom: 30,
  },
});

/*
================ Usage tests (do not remove) ================
1) Default
<ChargerSettingsScreen />

2) With navigation handlers
<ChargerSettingsScreen
  openPricing={(id)=>console.log('pricing', id)}
  openAvailability={(id)=>console.log('availability', id)}
/>

Route integration (expo-router):
- Place at app/chargers/settings.tsx
- Bottom tabs handled by layout
*/
