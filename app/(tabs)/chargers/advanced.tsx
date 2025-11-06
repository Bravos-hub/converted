// app/chargers/advanced.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native parity for S18_AdvancedConfiguration.jsx (MUI → React Native Paper)
// Bottom navigation intentionally omitted — handled by Tabs layout.

import * as React from 'react';
import { router } from 'expo-router';
import { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import {
  Provider as PaperProvider,
  Appbar,
  Button,
  Card,
  Text,
  TextInput,
  Switch,
  HelperText,
  Divider,
  Menu,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

export type Props = {
  onBack?: () => void;
  onHelp?: () => void;
  onSave?: (p: {
    mvInterval: number;
    mvMaxLen: number;
    caInterval: number;
    caMaxLen: number;
    reserveAll: boolean;
    maxCable: number;
    phaseRotation: string;
  }) => void;
};

export default function AdvancedConfigurationScreen({ onBack, onHelp, onSave }: Props) {
  const [mvInterval, setMvInterval] = useState(60);
  const [mvMaxLen, setMvMaxLen] = useState(5);
  const [caInterval, setCaInterval] = useState(300);
  const [caMaxLen, setCaMaxLen] = useState(5);
  const [reserveAll, setReserveAll] = useState(true);
  const [maxCable, setMaxCable] = useState(0);
  const [phaseRotation, setPhaseRotation] = useState('Rst');
  const [menuVisible, setMenuVisible] = useState(false);

  const handleSave = () => {
    const payload = { mvInterval, mvMaxLen, caInterval, caMaxLen, reserveAll, maxCable, phaseRotation };
    onSave ? onSave(payload) : console.log('Saved advanced configuration', payload);
  };

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <Appbar.Header style={styles.appbar}>
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="arrow-back-ios" />} onPress={() => (onBack ? onBack() : router.back())} />
        <Appbar.Content title="Advanced configuration" subtitle="data reporting • limits • behavior" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="help-outline" />} onPress={onHelp} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Meter Values — Sampled */}
        <Card mode="outlined" style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Meter values — sampled</Text>
            <TextInput
              label="Interval (seconds)"
              keyboardType="numeric"
              value={String(mvInterval)}
              onChangeText={(v) => setMvInterval(Number(v) || 0)}
              style={styles.input}
            />
            <HelperText type="info">How often the charger reports live session data.</HelperText>

            <TextInput
              label="Sampled data max length"
              keyboardType="numeric"
              value={String(mvMaxLen)}
              onChangeText={(v) => setMvMaxLen(Number(v) || 0)}
              style={styles.input}
            />
            <HelperText type="info">Max measurands included per sample message.</HelperText>
          </Card.Content>
        </Card>

        {/* Meter Values — Clock-aligned */}
        <Card mode="outlined" style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Meter values — clock‑aligned</Text>
            <TextInput
              label="Interval (seconds)"
              keyboardType="numeric"
              value={String(caInterval)}
              onChangeText={(v) => setCaInterval(Number(v) || 0)}
              style={styles.input}
            />
            <HelperText type="info">Fixed schedule reporting aligned to the clock.</HelperText>

            <TextInput
              label="Aligned data max length"
              keyboardType="numeric"
              value={String(caMaxLen)}
              onChangeText={(v) => setCaMaxLen(Number(v) || 0)}
              style={styles.input}
            />
            <HelperText type="info">Max measurands per aligned report.</HelperText>
          </Card.Content>
        </Card>

        {/* Connectors & Reservation */}
        <Card mode="outlined" style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Connectors & reservation</Text>
            <View style={styles.rowBetween}>
              <Text>Reserve connector zero</Text>
              <Switch value={reserveAll} onValueChange={setReserveAll} />
            </View>
            <HelperText type="info">Reserve all connectors by booking connector 0.</HelperText>

            <TextInput
              label="Max cable length (m)"
              keyboardType="numeric"
              value={String(maxCable)}
              onChangeText={(v) => setMaxCable(Number(v) || 0)}
              style={styles.input}
            />
            <HelperText type="info">0 means fixed cable or not set.</HelperText>

            <View style={styles.rowBetween}>
              <Text>Connector phase rotation</Text>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button mode="outlined" onPress={() => setMenuVisible(true)}>{phaseRotation}</Button>
                }>
                {['Rst', 'Srt', 'Trs'].map((opt) => (
                  <Menu.Item key={opt} title={opt} onPress={() => { setPhaseRotation(opt); setMenuVisible(false); }} />
                ))}
              </Menu>
            </View>
            <HelperText type="info">Load distribution for single‑phase EVs on 3‑phase sites.</HelperText>
          </Card.Content>
        </Card>

        <Divider style={{ marginVertical: 8 }} />

        <Button mode="contained" buttonColor="#f77f00" textColor="#fff" onPress={handleSave} style={styles.saveBtn}>
          Save configuration
        </Button>
      </ScrollView>
    </PaperProvider>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  appbar: { backgroundColor: '#03cd8c' },
  appbarTitle: { fontWeight: '800' },
  container: { padding: 16, paddingBottom: 32 },
  card: {
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eef3f1',
  },
  title: { fontWeight: '800', marginBottom: 4 },
  input: { marginBottom: 6 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  saveBtn: { borderRadius: 999, marginTop: 8 },
});

/*
================ Usage tests (do not remove) ================
1) Default
<AdvancedConfigurationScreen />

2) With save handler
<AdvancedConfigurationScreen onSave={(p)=>console.log('saved',p)} />

Route integration (expo-router):
- Place at app/chargers/advanced.tsx
- Bottom navigation handled by Tabs layout
*/
