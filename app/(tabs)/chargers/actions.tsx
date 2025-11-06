// app/chargers/actions.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native parity for S13_Actions.jsx (MUI → React Native Paper)
// Bottom navigation removed (Tabs handled by layout)

import React, { useState, useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Stack, router } from "expo-router";
import { BlurView } from "expo-blur";
import {
  Provider as PaperProvider,
  Appbar,
  Button,
  Card,
  Text,
  Chip,
  Divider,
  Menu,
  IconButton,
  Switch,
} from "react-native-paper";
import Slider from "@react-native-community/slider";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColorTheme } from "../../../hooks/use-color-theme";

type Charger = { id: string; name: string };

type Props = {
  chargers?: Charger[];
  defaultChargerId?: string;
  onBack?: () => void;
  onHelp?: () => void;
  onUnlock?: (payload: { chargerId: string; locked: boolean }) => void;
  onStart?: (payload: { chargerId: string; target: number }) => void;
};

export default function ChargerActionsScreen({
  chargers = [
    { id: "st1", name: "Home Charger" },
    { id: "st2", name: "Office Charger" },
  ],
  defaultChargerId = "st1",
  onBack,
  onHelp,
  onUnlock,
  onStart,
}: Props) {
  const C = useColorTheme();
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const selected = useMemo(
    () => chargers.find((c) => c.id === chargerId) || chargers[0],
    [chargers, chargerId]
  );
  const [menuVisible, setMenuVisible] = useState(false);
  const [target, setTarget] = useState(80);
  const [locked, setLocked] = useState(true);

  const handleUnlockToggle = () => {
    const next = !locked;
    setLocked(next);
    onUnlock?.({ chargerId, locked: next });
  };

  const handleStart = () => {
    onStart
      ? onStart({ chargerId, target })
      : console.log("Navigate → Charging session live");
  };

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <Appbar.Header style={[styles.appbar, { backgroundColor: C.primary }]}>
        <Appbar.Action
          icon={(p) => <MaterialIcons {...p} name="arrow-back-ios" />}
          onPress={() => (onBack ? onBack() : router.back())}
        />
        <Appbar.Content
          title="Charger actions"
          subtitle="unlock • start • set target"
          titleStyle={styles.appbarTitle}
        />
        <Appbar.Action
          icon={(p) => <MaterialIcons {...p} name="help-outline" />}
          onPress={onHelp}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* My chargers */}
        <BlurView intensity={30} tint="light" style={[styles.card, { borderColor: C.border }]}>
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

        {/* Charger status */}
        <Card mode="outlined" style={[styles.statusCard, { borderColor: C.border }]}>
          <Card.Content style={styles.rowCenter}>
            <MaterialCommunityIcons
              name="battery-charging"
              size={26}
              color={C.primary}
            />
            <View style={{ flex: 1 }}>
              <Text variant="titleSmall" style={styles.bold}>
                {selected?.name}
              </Text>
              <View style={styles.rowGap}>
                <Chip compact textStyle={{ color: C.onPrimary }} style={[styles.online, { backgroundColor: C.primary }]}>
                  Online
                </Chip>
                <Chip compact>{locked ? "Locked" : "Unlocked"}</Chip>
                <Chip compact>SoC: 42%</Chip>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Target SoC */}
        <Card mode="outlined" style={[styles.targetCard, { borderColor: C.border }]}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.bold}>
              Target state of charge
            </Text>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={50}
              maximumValue={100}
              step={1}
              value={target}
              minimumTrackTintColor={C.primary}
              maximumTrackTintColor={C.border}
              thumbTintColor={C.primary}
              onValueChange={(v) => setTarget(Math.round(v))}
            />
            <Text style={{ textAlign: "center", color: C.muted }}>
              Target: {target}%
            </Text>
          </Card.Content>
        </Card>

        {/* Footer buttons */}
        <View style={styles.footer}>
          <Button
            mode="outlined"
            icon={locked ? "lock-outline" : "lock-open-outline"}
            onPress={handleUnlockToggle}
            style={{ flex: 1, borderRadius: 999 }}
            textColor={locked ? undefined : C.onSecondary}
            buttonColor={!locked ? C.secondary : undefined}
          >
            {locked ? "Unlock" : "Lock"}
          </Button>

          <Button
            mode="contained"
            icon="power"
            buttonColor={C.secondary}
            textColor={C.onSecondary}
            onPress={handleStart}
            style={{ flex: 1, borderRadius: 999 }}
          >
            Start charging
          </Button>
        </View>
      </ScrollView>
    </PaperProvider>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  appbar: {},
  appbarTitle: { fontWeight: "800" },
  container: { padding: 16, paddingBottom: 60 },
  card: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    // themed via component
    marginBottom: 12,
  },
  cardInner: { padding: 12, backgroundColor: "rgba(255,255,255,0.55)" },
  statusCard: { borderRadius: 12, marginBottom: 12 },
  targetCard: { borderRadius: 12, marginTop: 8 },
  rowCenter: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowGap: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  bold: { fontWeight: "800" },
  online: {},
  footer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    marginBottom: 30,
  },
});
