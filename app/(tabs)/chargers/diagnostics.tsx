// app/chargers/diagnostics.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native parity for S21_Diagnostics&Logs.jsx (MUI → React Native Paper)
// Bottom navigation removed (your Tabs layout handles it)
//
// Dependencies:
//   expo install expo-blur
//   npm i react-native-paper @expo/vector-icons

import * as React from "react";
import { useMemo, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Stack, router } from "expo-router";
import {
  Provider as PaperProvider,
  Appbar,
  Button,
  Card,
  Chip,
  Text,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

type Fault = { id: string; code: string; title: string; severity: "Critical" | "Warning" | "Info"; time: string };
type EventRow = { id: string; title: string; time: string };

type Props = {
  onBack?: () => void;
  onHelp?: () => void;
  onExport?: (tab: "faults" | "events") => void;
  onFilter?: (tab: "faults" | "events") => void;
  onOpenFault?: (f: Fault) => void;
  faults?: Fault[];
  events?: EventRow[];
};

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardInner}>{children}</View>
    </View>
  );
}

function FaultRow({ f, onPress }: { f: Fault; onPress?: (f: Fault) => void }) {
  const chipStyle = useMemo(() => {
    switch (f.severity) {
      case "Critical": return styles.chipCritical;
      case "Warning":  return styles.chipWarning;
      default:         return styles.chipNeutral;
    }
  }, [f.severity]);

  return (
    <Card mode="outlined" style={{ marginBottom: 8 }} onPress={() => onPress?.(f)}>
      <Card.Content>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text variant="titleSmall" style={styles.bold}>{f.code} — {f.title}</Text>
            <Text variant="labelSmall" style={styles.muted}>{f.time}</Text>
          </View>
          <Chip compact style={chipStyle}>{f.severity}</Chip>
        </View>
      </Card.Content>
    </Card>
  );
}

export default function DiagnosticsLogsScreen({
  onBack,
  onHelp,
  onExport,
  onFilter,
  onOpenFault,
  faults = [
    { id: "f1", code: "E101", title: "Overcurrent detected", severity: "Critical", time: "2025-10-18 14:22" },
    { id: "f2", code: "W208", title: "Temperature high",     severity: "Warning",  time: "2025-10-15 09:10"  },
  ],
  events = [
    { id: "e1", title: "Session started",   time: "2025-10-18 14:00" },
    { id: "e2", title: "Connector locked",  time: "2025-10-18 14:01" },
  ],
}: Props) {
  const [tab, setTab] = useState<"faults" | "events">("faults");

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />
      {/* App bar */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="arrow-back-ios" />} onPress={() => (onBack ? onBack() : router.back())} />
        <Appbar.Content title="Diagnostics & logs" subtitle="faults • events • export" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="help-outline" />} onPress={() => onHelp?.()} />
      </Appbar.Header>

      {/* Tabs (chips) */}
      <View style={styles.tabsRow}>
        {(["faults","events"] as const).map(k => (
          <Chip
            key={k}
            compact
            selected={tab === k}
            onPress={() => setTab(k)}
            style={[styles.tabChip, tab === k && styles.tabChipSelected]}
            textStyle={tab === k ? styles.tabTextSelected : undefined}
          >
            {k}
          </Chip>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Faults */}
        {tab === "faults" ? (
          <GlassCard>
            {faults.map(f => (
              <FaultRow key={f.id} f={f} onPress={onOpenFault} />
            ))}
          </GlassCard>
        ) : (
          // Events
          <GlassCard>
            {events.map((e) => (
              <Card key={e.id} mode="outlined" style={{ marginBottom: 8 }}>
                <Card.Content>
                  <Text variant="titleSmall" style={styles.bold}>{e.title}</Text>
                  <Text variant="labelSmall" style={styles.muted}>{e.time}</Text>
                </Card.Content>
              </Card>
            ))}
          </GlassCard>
        )}
      </ScrollView>

      {/* Footer actions */}
      <View style={styles.footer}>
        <Button
          mode="outlined"
          icon="filter-variant"
          onPress={() => onFilter ? onFilter(tab) : null}
          style={styles.footerBtn}
        >
          Filter
        </Button>
        <Button
          mode="contained"
          icon="download"
          buttonColor="#f77f00"
          textColor="#fff"
          onPress={() => onExport ? onExport(tab) : null}
          style={styles.footerBtn}
        >
          Export
        </Button>
      </View>
    </PaperProvider>
  );
}

/* ========= Styles ========= */
const styles = StyleSheet.create({
  appbar: { backgroundColor: "#03cd8c" },
  appbarTitle: { fontWeight: "800" },
  container: { padding: 16, paddingBottom: 96 },
  tabsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingTop: 8 },
  tabChip: { borderRadius: 999, backgroundColor: "#fff" },
  tabChipSelected: { backgroundColor: "#f77f00" },
  tabTextSelected: { color: "#fff", fontWeight: "700" },
  card: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#eef3f1",
    marginTop: 8,
    marginBottom: 12,
  },
  cardInner: { padding: 12, backgroundColor: "rgba(255,255,255,0.55)" },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bold: { fontWeight: "800" },
  muted: { color: "#6b7280" },
  chipCritical: { backgroundColor: "#ffdad6" },
  chipWarning: { backgroundColor: "#fff3cd" },
  chipNeutral: { backgroundColor: "#e7f0ff" },
  footer: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    padding: 12,
    backgroundColor: "#f2f2f2",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e9eceb",
    flexDirection: "row",
    gap: 8,
  },
  footerBtn: { borderRadius: 999, flex: 1 },
});

/*
================ Usage tests (do not remove) ================
1) Default
<DiagnosticsLogsScreen />

2) Callbacks
<DiagnosticsLogsScreen
  onFilter={(t)=>console.log('filter', t)}
  onExport={(t)=>console.log('export', t)}
  onOpenFault={(f)=>console.log('open fault', f)}
/>

Route integration (expo-router):
- Place at app/chargers/diagnostics.tsx
- Bottom tabs are handled by your Tabs layout
*/
