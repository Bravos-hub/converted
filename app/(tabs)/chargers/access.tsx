// app/chargers/access.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native parity for S09_Access&Permissions.jsx

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Stack, router } from "expo-router";
import {
  Provider as PaperProvider,
  Appbar,
  Button,
  Card,
  Text,
  TextInput,
  RadioButton,
  Switch,
  Chip,
  IconButton,
  Divider,
  Snackbar,
} from "react-native-paper";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColorTheme } from "../../../hooks/use-color-theme";

// ---------- Types
type Charger = { id: string; name: string };
type Connector = { id: string; label: string };
type AccessUser = {
  id: string;
  name: string;
  relation: string;
  method: string[];
  status: "Active" | "Inactive";
};
type NewUser = {
  sid: string;
  relation: string;
  app: boolean;
  rfid: boolean;
  assignCard: boolean;
  offline: boolean;
  selfService: boolean;
};

type Props = {
  chargers?: Charger[];
  defaultChargerId?: string;
  commercialChargerId?: string;
  aggregatorUrl?: string;
  onOpenAggregator?: (
    url?: string,
    chargerId?: string,
    connectorId?: string,
    scope?: string
  ) => void;
  onBack?: () => void;
  onHelp?: () => void;
  onSave?: (payload: any) => void;
  onOpenUser?: (
    u: AccessUser,
    chargerId?: string,
    connectorId?: string,
    scope?: string
  ) => void;
  onOpenUserVehicles?: (
    u: AccessUser,
    chargerId?: string,
    connectorId?: string,
    scope?: string
  ) => void;
};

// ---------- Example connectors
const CONNECTORS: Record<string, Connector[]> = {
  st1: [
    { id: "c1", label: "A1 — Type 2" },
    { id: "c2", label: "A2 — CCS 2" },
  ],
  st2: [{ id: "c3", label: "B1 — CHAdeMO" }],
};

// ---------- Helpers (FIX: move dynamic styles out of StyleSheet)
const getStatusChipStyle = (status: "Active" | "Inactive", C: ReturnType<typeof useColorTheme>) => ({
  backgroundColor: status === "Active" ? C.primary : C.border,
  marginRight: 6,
});
const getStatusChipTextStyle = (_status: "Active" | "Inactive", C: ReturnType<typeof useColorTheme>) => ({
  color: C.onPrimary,
});

// ---------- Glassy card
const GlassCard = ({ children }: { children: React.ReactNode }) => {
  const C = useColorTheme();
  return (
    <View style={[styles.card, { borderColor: C.border }] }>
      <View style={styles.cardInner}>{children}</View>
    </View>
  );
};

// ---------- User Card
function UserCard({
  user,
  onEdit,
  onVehicles,
  onRemove,
}: {
  user: AccessUser;
  onEdit: (u: AccessUser) => void;
  onVehicles: (u: AccessUser) => void;
  onRemove: (u: AccessUser) => void;
}) {
  const C = useColorTheme();
  return (
    <Card mode="outlined" style={styles.userCard}>
      <Card.Content style={styles.rowCenter}>
        <View style={[styles.avatar, { backgroundColor: C.surface }]}>
          <Text style={styles.avatarText}>{user.name[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="titleSmall" style={styles.bold}>
            {user.name}
          </Text>
          <Text variant="labelSmall" style={[styles.muted, { color: C.muted }]}>
            {user.relation} • {user.method.join(", ")}
          </Text>
          <View style={styles.rowGap}>
            <Chip compact onPress={() => onEdit(user)}>
              Edit
            </Chip>
            <Chip compact onPress={() => onVehicles(user)}>
              Vehicles
            </Chip>
          </View>
        </View>
        {/* FIX: use helper for ViewStyle + textStyle for text color */}
        <Chip
          compact
          style={getStatusChipStyle(user.status, C)}
          textStyle={getStatusChipTextStyle(user.status, C)}
        >
          {user.status}
        </Chip>
        <IconButton icon="delete-outline" size={16} onPress={() => onRemove(user)} />
      </Card.Content>
    </Card>
  );
}

// ---------- Screen
export default function AccessPermissionsScreen({
  chargers = [
    { id: "st1", name: "Home Charger" },
    { id: "st2", name: "Office Charger" },
  ],
  defaultChargerId = "st1",
  commercialChargerId,
  aggregatorUrl,
  onOpenAggregator,
  onBack,
  onHelp,
  onSave,
  onOpenUser,
  onOpenUserVehicles,
}: Props) {
  const C = useColorTheme();
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [scope, setScope] = useState<"charger" | "connector">("charger");
  const connectors: Connector[] = useMemo(() => CONNECTORS[chargerId] ?? [], [chargerId]);
  const [connectorId, setConnectorId] = useState(connectors[0]?.id ?? "");
  useEffect(() => setConnectorId(CONNECTORS[chargerId]?.[0]?.id ?? ""), [chargerId]);

  const keyFor = (cid: string, sc: string, kid?: string) =>
    sc === "connector" ? `conn:${kid ?? ""}` : "__charger__";

  // nested users per charger
  const [users, setUsers] = useState<Record<string, Record<string, AccessUser[]>>>({
    st1: {
      __charger__: [
        {
          id: "1",
          name: "Robert Fox",
          relation: "Brother",
          method: ["App", "RFID"],
          status: "Active",
        },
      ],
      "conn:c1": [],
      "conn:c2": [],
    },
    st2: {
      __charger__: [
        {
          id: "2",
          name: "Albert Flores",
          relation: "Employee",
          method: ["App"],
          status: "Active",
        },
      ],
      "conn:c3": [],
    },
  });

  const [newUser, setNewUser] = useState<NewUser>({
    sid: "",
    relation: "Family",
    app: true,
    rfid: true,
    assignCard: false,
    offline: true,
    selfService: true,
  });
  const [snack, setSnack] = useState(false);

  const listUsers = () =>
    users[chargerId]?.[keyFor(chargerId, scope, connectorId)] ?? [];

  const addUser = () => {
    const id = Date.now().toString();
    const u: AccessUser = {
      id,
      name: newUser.sid || "New user",
      relation: newUser.relation,
      method: [newUser.app && "App", newUser.rfid && "RFID"].filter(
        Boolean
      ) as string[],
      status: "Active",
    };
    const key = keyFor(chargerId, scope, connectorId);
    setUsers((prev) => ({
      ...prev,
      [chargerId]: {
        ...(prev[chargerId] ?? {}),
        [key]: [...(prev[chargerId]?.[key] ?? []), u],
      },
    }));
    setNewUser({
      sid: "",
      relation: "Family",
      app: true,
      rfid: true,
      assignCard: false,
      offline: true,
      selfService: true,
    });
  };

  const removeUser = (user: AccessUser) => {
    const key = keyFor(chargerId, scope, connectorId);
    setUsers((prev) => ({
      ...prev,
      [chargerId]: {
        ...(prev[chargerId] ?? {}),
        [key]: (prev[chargerId]?.[key] ?? []).filter((x) => x.id !== user.id),
      },
    }));
  };

  const handleSave = () => {
    const payload = {
      scope,
      chargerId,
      connectorId: scope === "connector" ? connectorId : undefined,
      users: listUsers(),
    };
    onSave ? onSave(payload) : console.log("Save access", payload);
    setSnack(true);
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
          title="Access & permissions"
          subtitle="who can use per charger or connector"
          titleStyle={styles.appbarTitle}
        />
        <Appbar.Action
          icon={(p) => <MaterialIcons {...p} name="help-outline" />}
          onPress={() => onHelp?.()}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Target */}
        <GlassCard>
          <Text variant="titleSmall" style={styles.bold}>
            Target
          </Text>
          <Text variant="labelSmall" style={[styles.muted, { color: C.muted }]}>
            Select charger and scope
          </Text>
          <Button mode="outlined" onPress={() => {}}>
            {chargers.find((c) => c.id === chargerId)?.name}
          </Button>

          <RadioButton.Group
            value={scope}
            onValueChange={(v) => setScope(v as "charger" | "connector")}
          >
            <View style={styles.rowCenter}>
              <RadioButton value="charger" />
              <Text>Charger</Text>
              <RadioButton value="connector" />
              <Text>Connector</Text>
            </View>
          </RadioButton.Group>

          {scope === "connector" && (
            <Button mode="outlined" onPress={() => {}}>
              {connectors.find((k) => k.id === connectorId)?.label ??
                "Select connector"}
            </Button>
          )}
        </GlassCard>

        {/* Aggregator CTA */}
        <View style={styles.rowCenterBetween}>
          <Chip compact>{scope === "connector" ? `Connector ${connectorId}` : "Charger scope"}</Chip>
          <Button
            mode="text"
            textColor={C.secondary}
            onPress={() =>
              onOpenAggregator?.(aggregatorUrl, chargerId, connectorId, scope)
            }
          >
            Aggregator & CPMS
          </Button>
        </View>

        {/* User list */}
        {listUsers().map((u) => (
          <UserCard
            key={u.id}
            user={u}
            onEdit={(x) => onOpenUser?.(x, chargerId, connectorId, scope)}
            onVehicles={(x) =>
              onOpenUserVehicles?.(x, chargerId, connectorId, scope)
            }
            onRemove={removeUser}
          />
        ))}

        {/* Add user */}
        <GlassCard>
          <Text variant="titleSmall" style={styles.bold}>
            Add user
          </Text>
          <TextInput
            label="App SID"
            value={newUser.sid}
            onChangeText={(v) => setNewUser({ ...newUser, sid: v })}
            style={{ marginBottom: 8 }}
          />
          <RadioButton.Group
            value={newUser.relation}
            onValueChange={(v) => setNewUser({ ...newUser, relation: v })}
          >
            <View style={styles.rowCenter}>
              <RadioButton value="Family" />
              <Text>Family</Text>
              <RadioButton value="Employee" />
              <Text>Employee</Text>
              <RadioButton value="Guest" />
              <Text>Guest</Text>
            </View>
          </RadioButton.Group>

          <View style={styles.rowGap}>
            <Switch
              value={newUser.app}
              onValueChange={(v) => setNewUser({ ...newUser, app: v })}
            />
            <Text>App</Text>
            <Switch
              value={newUser.rfid}
              onValueChange={(v) => setNewUser({ ...newUser, rfid: v })}
            />
            <Text>RFID</Text>
            <Switch
              value={newUser.assignCard}
              onValueChange={(v) => setNewUser({ ...newUser, assignCard: v })}
            />
            <Text>Assign card</Text>
          </View>

          <View style={styles.rowGap}>
            <Switch
              value={newUser.offline}
              onValueChange={(v) => setNewUser({ ...newUser, offline: v })}
            />
            <Text>Allow offline access</Text>
          </View>
          <View style={styles.rowGap}>
            <Switch
              value={newUser.selfService}
              onValueChange={(v) => setNewUser({ ...newUser, selfService: v })}
            />
            <Text>Allow self service</Text>
          </View>

          <Button
            mode="contained"
            buttonColor={C.secondary}
            textColor={C.onSecondary}
            icon="account-plus"
            onPress={addUser}
            style={{ borderRadius: 999, marginTop: 8 }}
          >
            Add user
          </Button>
        </GlassCard>

        {/* Onboard shortcuts & limits */}
        <GlassCard>
          <Text variant="titleSmall" style={styles.bold}>
            Onboard shortcuts & limits
          </Text>
          <View style={styles.rowGap}>
            <Button mode="outlined" icon="link-variant" onPress={() => {}}>
              Invite link
            </Button>
            <Button mode="outlined" icon="qrcode" onPress={() => {}}>
              QR code
            </Button>
            <Button mode="outlined" icon="lock" onPress={() => {}}>
              Assign PIN
            </Button>
          </View>
          <Divider style={{ marginVertical: 8 }} />
          <View style={styles.rowGap}>
            <TextInput label="Max sessions/day" keyboardType="numeric" style={{ flex: 1 }} />
            <TextInput label="Max kWh/day" keyboardType="numeric" style={{ flex: 1 }} />
            <TextInput label="Max duration (min)" keyboardType="numeric" style={{ flex: 1 }} />
          </View>
        </GlassCard>

        <Button
          mode="contained"
          buttonColor={C.secondary}
          textColor={C.onSecondary}
          onPress={handleSave}
          style={styles.saveBtn}
        >
          Save access
        </Button>
      </ScrollView>

      <Snackbar visible={snack} onDismiss={() => setSnack(false)} duration={1500}>
        Access saved!
      </Snackbar>
    </PaperProvider>
  );
}

// ---------- Styles
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
  rowCenter: { flexDirection: "row", alignItems: "center" },
  rowCenterBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  rowGap: { flexDirection: "row", alignItems: "center", gap: 8 },
  bold: { fontWeight: "800" },
  muted: {},
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    // themed via component
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: { fontWeight: "700" },
  userCard: { marginBottom: 8 },
  // FIX: removed statusChip function from StyleSheet
  saveBtn: { borderRadius: 999, marginTop: 12 },
});
