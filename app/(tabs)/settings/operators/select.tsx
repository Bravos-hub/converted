// app/settings/operators/select.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native parity for S10_OperatorSelection.jsx
//
// Dependencies:
//   expo install expo-blur
//   npm i react-native-paper @expo/vector-icons
//
// Bottom navigation is handled by your Tabs layout.

import * as React from "react";
import { useState, useMemo } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Stack, router } from "expo-router";
import { BlurView } from "expo-blur";
import {
  Provider as PaperProvider,
  Appbar,
  Text,
  Button,
  TextInput,
  Chip,
  Card,
  IconButton,
  Avatar,
  Snackbar,
  List,
} from "react-native-paper";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

type Operator = {
  id: string;
  name: string;
  shift: "Day" | "Night";
  status: "Online" | "Offline";
  rating: number;
  reviews: number;
  photo?: string;
};

type Props = {
  onBack?: () => void;
  onHelp?: () => void;
  onConfirm?: (operator: Operator) => void;
};

// Glassy container
function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <BlurView intensity={25} tint="light" style={styles.card}>
      <View style={styles.cardInner}>{children}</View>
    </BlurView>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <MaterialIcons
          key={i}
          name="star"
          size={14}
          color={i < rating ? "#f7b500" : "#e0e0e0"}
        />
      ))}
    </View>
  );
}

function OperatorRow({
  op,
  selected,
  onSelect,
}: {
  op: Operator;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      mode="outlined"
      style={[
        styles.operatorCard,
        { borderColor: selected ? "#f77f00" : "#eef3f1" },
      ]}
      onPress={onSelect}
    >
      <Card.Content style={styles.rowCenter}>
        {selected ? (
          <MaterialIcons
            name="radio-button-checked"
            size={20}
            color="#f77f00"
            style={{ marginRight: 6 }}
          />
        ) : (
          <MaterialIcons
            name="radio-button-unchecked"
            size={20}
            color="#bdbdbd"
            style={{ marginRight: 6 }}
          />
        )}
        <Avatar.Image
          source={op.photo ? { uri: op.photo } : undefined}
          size={40}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text variant="titleSmall" style={styles.bold}>
            {op.name}
          </Text>
          <View style={styles.rowGap}>
            <Chip compact>{op.shift}</Chip>
            <Chip
              compact
              style={{
                backgroundColor: op.status === "Online" ? "#dcfce7" : "#f3f4f6",
              }}
            >
              {op.status}
            </Chip>
          </View>
          <View style={styles.rowGapSmall}>
            <RatingStars rating={op.rating} />
            <Text variant="labelSmall" style={styles.muted}>
              ({op.reviews})
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

export default function OperatorSelectionScreen({
  onBack,
  onHelp,
  onConfirm,
}: Props) {
  const [query, setQuery] = useState("");
  const [filterShift, setFilterShift] = useState<"All" | "Day" | "Night">("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snack, setSnack] = useState(false);

  const operators: Operator[] = [
    { id: "1", name: "Robert Fox", shift: "Day", status: "Online", rating: 4, reviews: 87 },
    { id: "2", name: "Albert Flores", shift: "Night", status: "Online", rating: 5, reviews: 132 },
    { id: "3", name: "Marvin McKinney", shift: "Day", status: "Offline", rating: 4, reviews: 54 },
    { id: "4", name: "Theresa Webb", shift: "Day", status: "Online", rating: 5, reviews: 203 },
  ];

  const filtered = useMemo(() => {
    return operators.filter(
      (op) =>
        (filterShift === "All" || op.shift === filterShift) &&
        op.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [operators, query, filterShift]);

  const handleConfirm = () => {
    const op = operators.find((o) => o.id === selectedId);
    if (op && onConfirm) {
      onConfirm(op);
      setSnack(true);
    }
  };

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <Appbar.Header style={styles.appbar}>
        <Appbar.Action
          icon={(props) => <MaterialIcons {...props} name="arrow-back-ios" />}
          onPress={() => (onBack ? onBack() : router.back())}
        />
        <Appbar.Content
          title="Operator selection"
          subtitle="pick a certified pro"
          titleStyle={styles.appbarTitle}
        />
        <Appbar.Action
          icon={(props) => <MaterialIcons {...props} name="help-outline" />}
          onPress={onHelp}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <GlassCard>
          <TextInput
            mode="outlined"
            label="Search operators"
            value={query}
            onChangeText={setQuery}
            left={<TextInput.Icon icon="magnify" />}
            style={{ marginBottom: 8 }}
          />
          <View style={styles.rowGap}>
            {["All", "Day", "Night"].map((key) => (
              <Chip
                key={key}
                selected={filterShift === key}
                onPress={() => setFilterShift(key as "All" | "Day" | "Night")}
                style={
                  filterShift === key ? styles.chipSelected : styles.chipDefault
                }
              >
                {key}
              </Chip>
            ))}
          </View>
        </GlassCard>

        {filtered.map((op) => (
          <OperatorRow
            key={op.id}
            op={op}
            selected={selectedId === op.id}
            onSelect={() => setSelectedId(op.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          buttonColor="#f77f00"
          textColor="#fff"
          disabled={!selectedId}
          onPress={handleConfirm}
          style={styles.confirmBtn}
        >
          Confirm operator
        </Button>
      </View>

      <Snackbar visible={snack} onDismiss={() => setSnack(false)} duration={1500}>
        Operator confirmed!
      </Snackbar>
    </PaperProvider>
  );
}

// ---------- Styles
const styles = StyleSheet.create({
  appbar: { backgroundColor: "#03cd8c" },
  appbarTitle: { fontWeight: "800" },
  container: { padding: 16, paddingBottom: 80 },
  card: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#eef3f1",
    marginBottom: 12,
  },
  cardInner: { padding: 12, backgroundColor: "rgba(255,255,255,0.55)" },
  operatorCard: {
    marginBottom: 8,
    borderRadius: 14,
    backgroundColor: "#fff",
  },
  rowCenter: { flexDirection: "row", alignItems: "center" },
  rowGap: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  rowGapSmall: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 2 },
  bold: { fontWeight: "700" },
  muted: { color: "#6b7280" },
  chipSelected: { backgroundColor: "#f77f00" },
  chipDefault: { backgroundColor: "#f2f2f2" },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: "#f2f2f2",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e9eceb",
  },
  confirmBtn: { borderRadius: 999, marginTop: 12 },
});

/*
================ Usage tests (do not remove) ================
1) Default
<OperatorSelectionScreen />

2) With confirm handler
<OperatorSelectionScreen onConfirm={(op)=>console.log('chosen', op)} />

Route integration (expo-router):
- Place this file at app/operators/select.tsx
- Bottom navigation is handled by your Tabs layout
*/
