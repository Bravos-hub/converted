// app/chargers/site-selector.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native parity for S16_SiteSelector.jsx (MUI → React Native Paper)

import * as React from "react";
import { useState } from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { Stack, router } from "expo-router";
import {
  Provider as PaperProvider,
  Appbar,
  Button,
  Card,
  Chip,
  Switch,
  Text,
  Divider,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

type Site = { id: string; name: string; address: string };

type Props = {
  onBack?: () => void;
  onHelp?: () => void;
  onNavChange?: (v: number) => void; // kept for parity with web footer
  onConfirm?: (p: { selected: string; mobileStation: boolean }) => void;
  openAddSite?: () => void;             // preferred
  onAddSite?: () => void;               // fallback (legacy)
};

const SITES: Site[] = [
  { id: "1", name: "EVzone Charge Station", address: "Kampala, Uganda" },
  { id: "2", name: "Soroti Charge Station", address: "Soroti, Uganda" },
];

function SiteRow({
  site,
  selected,
  onSelect,
}: {
  site: Site;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <Pressable onPress={() => onSelect(site.id)} style={{ width: "100%" }}>
      <Card
        mode="outlined"
        style={[
          styles.siteCard,
          selected ? styles.siteCardSelected : styles.siteCardIdle,
        ]}
      >
        <Card.Content style={styles.siteRow}>
          <MaterialIcons
            name={selected ? "radio-button-checked" : "radio-button-unchecked"}
            size={20}
            color={selected ? "#f77f00" : "#9ca3af"}
            style={{ marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.siteName}>{site.name}</Text>
            <Text style={styles.siteAddress}>{site.address}</Text>
          </View>
        </Card.Content>
      </Card>
    </Pressable>
  );
}

export default function ChooseSiteScreen({
  onBack,
  onHelp,
  onConfirm,
  openAddSite,
  onAddSite,
}: Props) {
  const [selected, setSelected] = useState<string>("1");
  const [mobileStation, setMobileStation] = useState<boolean>(false);

  const handleConfirm = () => {
    onConfirm
      ? onConfirm({ selected, mobileStation })
      : console.info("Confirmed site", { selected, mobileStation });
  };

  const handleAddSite = () => {
    if (openAddSite) return openAddSite();
    if (onAddSite) return onAddSite();
    console.info("Navigate to: Add Site");
  };

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />

      <Appbar.Header style={styles.appbar}>
        <Appbar.Action
          icon={(p) => <MaterialIcons {...p} name="arrow-back-ios" />}
          onPress={() => (onBack ? onBack() : router.back())}
        />
        <Appbar.Content
          title="Choose site"
          subtitle="select or add a location"
          titleStyle={styles.appbarTitle}
        />
        <Appbar.Action
          icon={(p) => <MaterialIcons {...p} name="help-outline" />}
          onPress={onHelp}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Mobile station toggle + Add site */}
        <Card mode="outlined" style={styles.controlCard}>
          <Card.Content style={styles.rowBetween}>
            <View style={styles.rowCenter}>
              <Switch
                value={mobileStation}
                onValueChange={setMobileStation}
              />
              <Text style={{ marginLeft: 8 }}>Mobile station</Text>
            </View>
            <Button mode="outlined" onPress={handleAddSite}>
              + Add site
            </Button>
          </Card.Content>
        </Card>

        {/* Sites list */}
        <View style={{ gap: 8 }}>
          {SITES.map((s) => (
            <SiteRow
              key={s.id}
              site={s}
              selected={selected === s.id}
              onSelect={setSelected}
            />
          ))}
        </View>

        <Divider style={{ marginVertical: 12 }} />

        <Button
          mode="contained"
          buttonColor="#f77f00"
          textColor="#fff"
          onPress={handleConfirm}
          style={styles.confirmBtn}
        >
          Confirm
        </Button>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  appbar: { backgroundColor: "#03cd8c" },
  appbarTitle: { fontWeight: "800" },
  container: { padding: 16, paddingBottom: 28 },
  controlCard: {
    borderRadius: 14,
    marginBottom: 12,
  },
  rowCenter: { flexDirection: "row", alignItems: "center" },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  siteCard: {
    borderRadius: 14,
  },
  siteCardIdle: {
    borderColor: "#eef3f1",
  },
  siteCardSelected: {
    borderColor: "#f77f00",
    borderWidth: 2,
  },
  siteRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  siteName: { fontWeight: "800" },
  siteAddress: { color: "#6b7280", marginTop: 2 },
  confirmBtn: { borderRadius: 999, paddingVertical: 6 },
});

/*
================ Usage tests (do not remove) ================
1) Default
<ChooseSiteScreen />

2) With callbacks
<ChooseSiteScreen
  onConfirm={(p)=>console.log('confirm', p)}
  openAddSite={()=>console.log('open add site')}
/>

Route integration (expo-router):
- Place at app/chargers/site-selector.tsx
- Bottom tabs handled by your layout (footer nav removed on native)
*/
