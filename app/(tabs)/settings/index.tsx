// app/settings/index.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native parity for S25_AccessUserProfile.jsx (MUI → React Native Paper)
// - Bottom navigation omitted (handled by your Tabs layout)
//
// Dependencies:
//   expo install expo-blur
//   npm i react-native-paper @expo/vector-icons

import * as React from 'react';
import { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { BlurView } from 'expo-blur';
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
  Divider,
  Snackbar,
} from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// ===== Types =====
export type Relation = 'Family' | 'Employee' | 'Guest';
export type UserForm = {
  name: string;
  sid: string;
  relation: Relation;
  app: boolean;
  rfid: boolean;
  assignCard: boolean;
  cardNo?: string;
  offline: boolean;
  selfService: boolean;
};

export type Props = {
  initial?: UserForm;
  onBack?: () => void;
  onHelp?: () => void;
  onSaveUser?: (u: UserForm) => void;
  onDeleteUser?: (u: UserForm) => void;
  onOpenVehicles?: (u: UserForm) => void;
};

// ===== Glassy card =====
function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <BlurView intensity={30} tint="light" style={styles.card}>
      <View style={styles.cardInner}>{children}</View>
    </BlurView>
  );
}

export default function UserEditorScreen({
  initial = {
    name: 'Robert Fox',
    sid: 'APP-123456',
    relation: 'Family',
    app: true,
    rfid: true,
    assignCard: false,
    cardNo: '',
    offline: true,
    selfService: true,
  },
  onBack,
  onHelp,
  onSaveUser,
  onDeleteUser,
  onOpenVehicles,
}: Props) {
  const [form, setForm] = useState<UserForm>(initial);
  const [snack, setSnack] = useState<string | null>(null);

  const save = () => {
    onSaveUser ? onSaveUser(form) : console.log('Save user', form);
    setSnack('User saved');
  };

  const del = () => {
    onDeleteUser ? onDeleteUser(form) : console.log('Delete user', form);
    setSnack('User removed');
  };

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Appbar */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="arrow-back-ios" />} onPress={() => (onBack ? onBack() : router.back())} />
        <Appbar.Content title="User editor" subtitle="identity • methods • permissions" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="help-outline" />} onPress={() => onHelp?.()} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Identity */}
        <GlassCard>
          <View style={styles.rowCenterGap}>
            <MaterialIcons name="person" size={18} />
            <Text variant="titleSmall" style={styles.bold}>Identity</Text>
          </View>
          <TextInput label="Full name" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} style={styles.field} />
          <TextInput label="App SID" value={form.sid} onChangeText={(v) => setForm({ ...form, sid: v })} style={styles.field} />

          <Text style={[styles.muted, { marginBottom: 6 }]}>Relation</Text>
          <RadioButton.Group value={form.relation} onValueChange={(v) => setForm({ ...form, relation: v as Relation })}>
            <View style={styles.rowCenterGap}>
              {(['Family','Employee','Guest'] as Relation[]).map((r) => (
                <View key={r} style={styles.rowCenterGap}>
                  <RadioButton value={r} />
                  <Text>{r}</Text>
                </View>
              ))}
            </View>
          </RadioButton.Group>
        </GlassCard>

        {/* Access methods */}
        <GlassCard>
          <View style={styles.rowCenterGap}>
            <MaterialCommunityIcons name="devices" size={18} />
            <Text variant="titleSmall" style={styles.bold}>Access methods</Text>
          </View>
          <View style={[styles.rowCenterGap, { marginTop: 6 }] }>
            <Switch value={form.app} onValueChange={(v) => setForm({ ...form, app: v })} />
            <Text>App</Text>
            <Switch value={form.rfid} onValueChange={(v) => setForm({ ...form, rfid: v })} />
            <Text>RFID</Text>
            <Switch value={form.assignCard} onValueChange={(v) => setForm({ ...form, assignCard: v })} />
            <Text>Assign card</Text>
          </View>
          {form.assignCard && (
            <TextInput label="Card number" value={form.cardNo} onChangeText={(v) => setForm({ ...form, cardNo: v })} style={styles.field} />
          )}
          <View style={styles.rowCenterGap}>
            <Switch value={form.offline} onValueChange={(v) => setForm({ ...form, offline: v })} />
            <Text>Allow offline</Text>
            <Switch value={form.selfService} onValueChange={(v) => setForm({ ...form, selfService: v })} />
            <Text>Allow self service</Text>
          </View>
        </GlassCard>

        {/* Vehicles */}
        <GlassCard>
          <View style={styles.rowCenter}>
            <MaterialIcons name="directions-car" size={18} />
            <Text variant="titleSmall" style={[styles.bold, { marginLeft: 6 }]}>Authorized vehicles</Text>
            <Chip compact style={{ marginLeft: 'auto' }} onPress={() => onOpenVehicles ? onOpenVehicles(form) : console.log('Open vehicles')}>
              Manage
            </Chip>
          </View>
          <Text variant="bodySmall" style={styles.muted}>Manage which of the user’s vehicles can charge at this site.</Text>
        </GlassCard>

        {/* Footer actions */}
        <View style={styles.footerRow}>
          <Button mode="outlined" textColor="#b00020" onPress={del} style={styles.pill} icon="delete-outline">
            Delete
          </Button>
          <Button mode="contained" buttonColor="#f77f00" textColor="#fff" onPress={save} style={styles.pill} icon="content-save">
            Save
          </Button>
        </View>
      </ScrollView>

      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={1500}>
        {snack}
      </Snackbar>
    </PaperProvider>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  appbar: { backgroundColor: '#03cd8c' },
  appbarTitle: { fontWeight: '800' },
  container: { padding: 16, paddingBottom: 60 },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eef3f1',
    marginBottom: 12,
  },
  cardInner: { padding: 12, backgroundColor: 'rgba(255,255,255,0.55)' },
  field: { marginBottom: 8 },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  rowCenterGap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  bold: { fontWeight: '800' },
  muted: { color: '#6b7280' },
  pill: { borderRadius: 999, flex: 1 },
});

/*
================ Usage tests (do not remove) ================
1) Default
<UserEditorScreen />

2) With handlers
<UserEditorScreen
  onSaveUser={(u)=>console.log('save', u)}
  onDeleteUser={(u)=>console.log('delete', u)}
  onOpenVehicles={(u)=>console.log('open vehicles for', u)}
/>

Route integration (expo-router):
- Place at app/chargers/user-editor.tsx
- Tabs layout controls the bottom nav elsewhere
*/
