// app/chargers/access-user-vehicles.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native parity for S26_AccessUserVehicles.jsx (MUI → React Native Paper)
// - List authorized vehicles with toggle
// - Open QR poster per vehicle or global
// - Add vehicle + Save footer actions
//
// Dependencies:
//   expo install expo-blur
//   npm i react-native-paper @expo/vector-icons

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
  Chip,
  Text,
  IconButton,
  Snackbar,
  Divider,
} from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// ===== Types =====
export type Vehicle = { id: string; model: string; plate: string; authorized: boolean };
export type Props = {
  vehicles?: Vehicle[];
  onBack?: () => void;
  onHelp?: () => void;
  onToggleVehicle?: (v: Vehicle) => void;
  onSave?: (vehicles: Vehicle[]) => void;
  onAddVehicle?: () => void;
  onOpenQrPoster?: (vehicle?: Vehicle) => void; // if undefined → open generic poster
};

// ===== Glassy card =====
function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <BlurView intensity={30} tint="light" style={styles.card}>
      <View style={styles.cardInner}>{children}</View>
    </BlurView>
  );
}

// ===== Vehicle row =====
function VehicleRow({ v, onToggle, onOpenQr }: { v: Vehicle; onToggle: (v: Vehicle) => void; onOpenQr?: (v: Vehicle) => void; }) {
  return (
    <Card mode="outlined" style={styles.vehicleRow}>
      <Card.Content style={styles.rowCenterBetween}>
        <View style={{ flex: 1 }}>
          <Text variant="titleSmall" style={styles.bold}>{v.model}</Text>
          <Text variant="labelSmall" style={styles.muted}>{v.plate}</Text>
        </View>
        <Chip compact style={[styles.pillMini, v.authorized ? styles.chipOn : styles.chipOff]}>{v.authorized ? 'Authorized' : 'Blocked'}</Chip>
        <IconButton icon={(p) => <MaterialCommunityIcons {...p} name="qrcode" />} onPress={() => onOpenQr?.(v)} accessibilityLabel="Open QR poster" />
        <IconButton icon={(p) => <MaterialIcons {...p} name={v.authorized ? 'toggle-on' : 'toggle-off'} />} onPress={() => onToggle(v)} accessibilityLabel="Toggle authorization" />
      </Card.Content>
    </Card>
  );
}

// ===== Screen =====
export default function AccessUserVehiclesScreen({
  vehicles: initialVehicles = [
    { id: 'v1', model: 'Tesla Model X', plate: 'UBF 123X', authorized: true },
    { id: 'v2', model: 'Tesla Model 3', plate: 'UAY 782P', authorized: false },
  ],
  onBack,
  onHelp,
  onToggleVehicle,
  onSave,
  onAddVehicle,
  onOpenQrPoster,
}: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [snack, setSnack] = useState(false);

  const authorizedCount = useMemo(() => vehicles.filter(v => v.authorized).length, [vehicles]);

  const toggle = (v: Vehicle) => {
    const next = vehicles.map(x => x.id === v.id ? { ...x, authorized: !x.authorized } : x);
    setVehicles(next);
    const changed = next.find(x => x.id === v.id)!;
    onToggleVehicle?.(changed);
  };

  const handleSave = () => {
    onSave ? onSave(vehicles) : console.log('Save vehicles', vehicles);
    setSnack(true);
  };

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />

      {/* App bar */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="arrow-back-ios" />} onPress={() => (onBack ? onBack() : router.back())} />
        <Appbar.Content title="User vehicles" subtitle="authorize which vehicles can charge" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="help-outline" />} onPress={() => onHelp?.()} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <GlassCard>
          <View style={styles.rowCenter}>
            <MaterialIcons name="directions-car" size={18} color="#03cd8c" />
            <Text variant="titleSmall" style={[styles.bold, { marginLeft: 8 }]}>Authorized vehicles</Text>
            <Chip compact style={{ marginLeft: 'auto' }}>{authorizedCount} / {vehicles.length}</Chip>
          </View>
        </GlassCard>

        {/* List */}
        {vehicles.map(v => (
          <VehicleRow key={v.id} v={v} onToggle={toggle} onOpenQr={onOpenQrPoster} />
        ))}

        {/* Spacer for footer */}
        <View style={{ height: 88 }} />
      </ScrollView>

      {/* Sticky footer actions */}
      <View style={styles.footer}>
        <View style={styles.footerBar}>
          <Button mode="outlined" icon={(p) => <MaterialIcons {...p} name="add-circle-outline" />} onPress={() => onAddVehicle ? onAddVehicle() : console.log('Add vehicle')} style={styles.footerBtn}>Add vehicle</Button>
          <Button mode="outlined" icon={(p) => <MaterialCommunityIcons {...p} name="qrcode" />} onPress={() => onOpenQrPoster ? onOpenQrPoster() : console.log('Open QR Poster')} style={styles.footerBtn}>QR Poster</Button>
          <Button mode="contained" buttonColor="#f77f00" textColor="#fff" onPress={handleSave} style={[styles.footerBtn, styles.saveBtn]}>Save</Button>
        </View>
      </View>

      <Snackbar visible={snack} onDismiss={() => setSnack(false)} duration={1500}>Vehicles saved!</Snackbar>
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
    marginBottom: 8,
  },
  cardInner: { padding: 12, backgroundColor: 'rgba(255,255,255,0.55)' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  rowCenterBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bold: { fontWeight: '800' },
  muted: { color: '#6b7280' },
  vehicleRow: { marginBottom: 8, borderRadius: 12 },
  pillMini: { borderRadius: 999 },
  chipOn: { backgroundColor: '#e6fbf4' },
  chipOff: { backgroundColor: '#eee' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  footerBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, paddingBottom: 12,
    backgroundColor: '#f2f2f2', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e9eceb'
  },
  footerBtn: { borderRadius: 999, flex: 1 },
  saveBtn: { },
});

/*
================ Usage tests (do not remove) ================
1) Default
<AccessUserVehiclesScreen />

2) With handlers
<AccessUserVehiclesScreen
  onToggleVehicle={(v)=>console.log('toggle', v)}
  onSave={(vs)=>console.log('save', vs)}
  onAddVehicle={()=>console.log('add')}
  onOpenQrPoster={(v)=>console.log('open qr', v?.id)}
/>

Route integration (expo-router):
- Place at app/chargers/access-user-vehicles.tsx
- Bottom navigation is handled by your Tabs layout
*/
