// app/chargers/session-summary.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native parity for S14B_SessionSummary.jsx (MUI → React Native Paper)
// Bottom navigation removed (handled by Tabs layout)

import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Stack, router } from "expo-router";
import {
  Provider as PaperProvider,
  Appbar,
  Card,
  Button,
  Text,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useColorTheme } from "../../../hooks/use-color-theme";
import { GlassCard } from "../../../components/ui/glass-card";

type Props = {
  site?: string;
  connector?: string;
  start?: string;
  end?: string;
  kwh?: number;
  duration?: string;
  cost?: number;
  currency?: string;
  receiptId?: string;
  onBack?: () => void;
  onHelp?: () => void;
  onShare?: (id: string) => void;
  onDownload?: (id: string) => void;
  onViewReceipt?: (id: string) => void;
  onDone?: () => void;
};

export default function SessionSummaryScreen({
  site = "Home Charger",
  connector = "CCS2",
  start = "10:12",
  end = "11:05",
  kwh = 12.8,
  duration = "53m",
  cost = 14880,
  currency = "UGX",
  receiptId = "RCPT-2025-10-001",
  onBack,
  onHelp,
  onShare,
  onDownload,
  onViewReceipt,
  onDone,
}: Props) {
  const C = useColorTheme();
  const items = [
    { label: "Energy", value: `${kwh} kWh` },
    { label: "Duration", value: duration },
    { label: "Cost", value: `${currency} ${cost.toLocaleString()}` },
  ];

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.root}>
        <Appbar.Header style={[styles.appbar, { backgroundColor: C.primary }]}>
          <Appbar.Action
            icon={(p) => <MaterialIcons {...p} name="arrow-back-ios" />}
            onPress={() => router.back()}
          />
          <Appbar.Content
            title="Session summary"
            subtitle="energy • time • cost"
            titleStyle={styles.appbarTitle}
          />
          <Appbar.Action
            icon={(p) => <MaterialIcons {...p} name="help-outline" />}
            onPress={onHelp}
          />
        </Appbar.Header>

        <ScrollView contentContainerStyle={styles.container}>
          <GlassCard style={styles.block} contentStyle={styles.cardInner}>
            <Text style={[styles.titleSmall, styles.bold]}>{site}</Text>
            <Text style={[styles.labelSmall, styles.muted, { color: C.muted }]}>
              Connector: {connector}
            </Text>

            <View style={styles.metricGrid}>
              {items.map((m, i) => (
                <Card key={i} mode="outlined" style={styles.metricCard}>
                  <Card.Content style={{ alignItems: "center" }}>
                    <Text style={[styles.labelSmall, styles.muted, { color: C.muted }]}>
                      {m.label}
                    </Text>
                    <Text style={[styles.titleSmall, styles.bold]}>
                      {m.value}
                    </Text>
                  </Card.Content>
                </Card>
              ))}
            </View>

            <Text style={[styles.caption, styles.muted, { marginTop: 8, color: C.muted }]}>
              Start {start} • End {end}
            </Text>

            <View style={styles.rowGap}>
              <Button
                mode="outlined"
                icon="receipt"
                onPress={() => onViewReceipt?.(receiptId)}
                style={styles.pill}
              >
                View receipt
              </Button>
              <Button
                mode="outlined"
                icon="download"
                onPress={() => onDownload?.(receiptId)}
                style={styles.pill}
              >
                Download
              </Button>
              <Button
                mode="contained"
                icon="share-variant"
                buttonColor={C.secondary}
                textColor={C.onSecondary}
                onPress={() => onShare?.(receiptId)}
                style={styles.pill}
              >
                Share
              </Button>
            </View>
          </GlassCard>

          <View style={styles.footer}>
            <Button
              mode="contained"
              buttonColor={C.primary}
              textColor={C.onPrimary}
              onPress={onDone}
              style={styles.doneBtn}
            >
              Done
            </Button>
          </View>
        </ScrollView>
      </View>
    </PaperProvider>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f2f2f2" },
  appbar: {},
  appbarTitle: { fontWeight: "800" },
  container: { padding: 16, paddingBottom: 60 },
  block: { marginBottom: 12 },
  cardInner: { backgroundColor: "rgba(255,255,255,0.55)" },
  bold: { fontWeight: "800" },
  muted: {},

  // Typography replacements for Paper variants
  titleSmall: { fontSize: 16, lineHeight: 22 },
  labelSmall: { fontSize: 12, lineHeight: 16, fontWeight: "500" },
  caption: { fontSize: 12, lineHeight: 16 },

  metricGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  metricCard: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 12,
  },
  rowGap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    marginTop: 12,
  },
  pill: { borderRadius: 999, flex: 1 },
  footer: { alignItems: "center", marginTop: 16 },
  doneBtn: {
    borderRadius: 999,
    width: "80%",
  },
});

/*
================ Usage tests (do not remove) ================
1) Default
<SessionSummaryScreen />

2) With actions
<SessionSummaryScreen
  onShare={(id)=>console.log('share',id)}
  onViewReceipt={(id)=>console.log('receipt',id)}
  onDone={()=>console.log('done')}
/>

Route integration (expo-router):
- Place at app/chargers/session-summary.tsx
- Bottom tabs handled by layout
*/
