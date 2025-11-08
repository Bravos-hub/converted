// app/chargers/schedule-editor.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native parity for S23_CreateOrEditSchedule.jsx (MUI → React Native Paper)
// Bottom navigation omitted (tabs layout handles it)

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
  Divider,
  Switch,
  Text,
  TextInput,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { GlassCard } from "../../../components/ui/glass-card";

// ---------- Types ----------
type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

type Schedule = {
  name: string;
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
  target: number; // 50..100
  days: Day[];
  enabled: boolean;
};

type Props = {
  mode?: "create" | "edit";
  initial?: Schedule;
  onBack?: () => void;
  onHelp?: () => void;
  onSave?: (s: Schedule) => void;
  onCancel?: () => void;
  onDelete?: (s: Schedule) => void;
};

const DAYS: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ---------- Day chips ----------
function DayChips({
  value,
  onToggle,
}: {
  value: Day[];
  onToggle: (d: Day) => void;
}) {
  return (
    <View style={styles.rowWrap}>
      {DAYS.map((d) => {
        const selected = value.includes(d);
        return (
          <Chip
            key={d}
            compact
            selected={!!selected}
            style={[styles.dayChip, selected && styles.dayChipOn]}
            onPress={() => onToggle(d)}
          >
            {d}
          </Chip>
        );
      })}
    </View>
  );
}

// ---------- Screen ----------
export default function ScheduleEditorScreen({
  mode = "create",
  initial = {
    name: "",
    start: "22:00",
    end: "06:00",
    target: 90,
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    enabled: true,
  },
  onBack,
  onHelp,
  onSave,
  onCancel,
  onDelete,
}: Props) {
  const [form, setForm] = useState<Schedule>(initial);

  const chips = useMemo(
    () => [
      { icon: "clock-outline", label: `${form.start} → ${form.end}` },
      { icon: "battery-charging-high", label: `Target ${form.target}%` },
      { icon: undefined, label: form.days.join(", ") || "No days" },
    ],
    [form]
  );

  const toggleDay = (d: Day) =>
    setForm((s) => ({
      ...s,
      days: s.days.includes(d) ? s.days.filter((x) => x !== d) : [...s.days, d],
    }));

  const save = () => (onSave ? onSave(form) : console.log("save", form));
  const cancel = () => (onCancel ? onCancel() : console.log("cancel"));
  const del = () => (onDelete ? onDelete(form) : console.log("delete", form));

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.root}>
        <Appbar.Header style={styles.appbar}>
        <Appbar.Action
          icon={(p) => <MaterialIcons {...p} name="arrow-back-ios" />}
          onPress={() => (onBack ? onBack() : router.back())}
        />
        <Appbar.Content
          title={mode === "edit" ? "Edit schedule" : "Create schedule"}
          subtitle="times • target SoC • days"
          titleStyle={styles.appbarTitle}
        />
        <Appbar.Action
          icon={(p) => <MaterialIcons {...p} name="help-outline" />}
          onPress={onHelp}
        />
      </Appbar.Header>

        <ScrollView contentContainerStyle={styles.container}>
        <GlassCard>
          <Text variant="titleSmall" style={styles.bold}>
            Details
          </Text>
          <TextInput
            label="Name"
            value={form.name}
            onChangeText={(v) => setForm((s) => ({ ...s, name: v }))}
            style={{ marginTop: 8 }}
          />

          <View style={[styles.rowGap, { marginTop: 8 }]}>
            <TextInput
              label="Start (HH:mm)"
              value={form.start}
              onChangeText={(v) => setForm((s) => ({ ...s, start: v }))}
              style={{ flex: 1 }}
              keyboardType="numbers-and-punctuation"
            />
            <TextInput
              label="End (HH:mm)"
              value={form.end}
              onChangeText={(v) => setForm((s) => ({ ...s, end: v }))}
              style={{ flex: 1 }}
              keyboardType="numbers-and-punctuation"
            />
          </View>

          <Text style={[styles.bold, { marginTop: 12 }]}>
            Target state of charge
          </Text>
          <View style={styles.sliderRow}>
            <Slider
              minimumValue={50}
              maximumValue={100}
              step={1}
              value={form.target}
              onValueChange={(v: number) =>
                setForm((s) => ({ ...s, target: Math.round(v) }))
              }
              style={{ flex: 1 }}
            />
            <Text style={[styles.bold, { width: 44, textAlign: "right" }]}>
              {form.target}%
            </Text>
          </View>

          <Text style={[styles.bold, { marginTop: 12 }]}>Days</Text>
          <DayChips value={form.days} onToggle={toggleDay} />

          <View style={[styles.rowCenterBetween, { marginTop: 8 }]}>
            <Text style={styles.muted}>Enabled</Text>
            <Switch
              value={form.enabled}
              onValueChange={(v) => setForm((s) => ({ ...s, enabled: v }))}
            />
          </View>

          <Divider style={{ marginVertical: 12 }} />

          <View style={styles.rowWrap}>
            {chips.map((c, i) => (
              <Chip key={i} icon={c.icon as any} compact style={{ marginRight: 6, marginBottom: 6 }}>
                {c.label}
              </Chip>
            ))}
          </View>
        </GlassCard>

        {/* Footer actions */}
        <View style={styles.footerRow}>
          <Button mode="outlined" onPress={cancel} style={styles.pill}>
            Cancel
          </Button>
          {mode === "edit" && (
            <Button
              mode="outlined"
              textColor="#b00020"
              onPress={del}
              style={styles.pill}
            >
              Delete
            </Button>
          )}
          <Button
            mode="contained"
            buttonColor="#f77f00"
            textColor="#fff"
            onPress={save}
            style={[styles.pill, { marginLeft: "auto" }]}
          >
            Save
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
  appbar: { backgroundColor: "#03cd8c" },
  appbarTitle: { fontWeight: "800" },
  container: { padding: 16, paddingBottom: 40 },
  bold: { fontWeight: "800" },
  muted: { color: "#6b7280" },
  rowGap: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowWrap: { flexDirection: "row", flexWrap: "wrap" },
  rowCenterBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sliderRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  dayChip: { marginRight: 6, marginTop: 6 },
  dayChipOn: { backgroundColor: "#fdebd0" },
  footerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  pill: { borderRadius: 999, flexGrow: 1 },
});

/*
================ Usage tests (do not remove) ================
1) Create
<ScheduleEditorScreen onSave={(s)=>console.log('save', s)} />

2) Edit
<ScheduleEditorScreen
  mode="edit"
  initial={{ name:'Weekdays night', start:'22:00', end:'06:00', target:90, days:['Mon','Tue','Wed','Thu','Fri'], enabled:true }}
  onDelete={(s)=>console.log('delete', s)}
/>

Route integration (expo-router):
- Place at app/chargers/schedule-editor.tsx
- Tabs layout handles bottom navigation
*/
