// app/settings/sites/add.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native parity for S17_AddSite.jsx (MUI → React Native Paper)
// Bottom navigation is intentionally omitted (handled by your Tabs layout)
//
// Dependencies:
//   expo install expo-blur
//   npm i react-native-paper @expo/vector-icons

import * as React from 'react';
import { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { Stack, router } from 'expo-router';
import { BlurView } from 'expo-blur';
import {
  Provider as PaperProvider,
  Appbar,
  Text,
  TextInput,
  Button,
  Card,
  Snackbar,
  Divider,
} from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// ===== Types
export type Props = {
  onBack?: () => void;
  onHelp?: () => void;
  onConfirm?: (p: { address: string; siteName: string }) => void;
};

export default function AddSiteScreen({ onBack, onHelp, onConfirm }: Props) {
  const [address, setAddress] = useState('');
  const [siteName, setSiteName] = useState('');
  const [snack, setSnack] = useState(false);

  const confirm = () => {
    onConfirm ? onConfirm({ address, siteName }) : console.log('Site saved', { address, siteName });
    setSnack(true);
  };

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />

      {/* App Bar */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="arrow-back-ios" />} onPress={() => (onBack ? onBack() : router.back())} />
        <Appbar.Content title="Add a site" subtitle="pin the location and name it" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="help-outline" />} onPress={() => onHelp?.()} />
      </Appbar.Header>

      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Map placeholder with red pin */}
          <BlurView intensity={30} tint="light" style={styles.card}>
            <View style={styles.cardInner}>
              <View style={styles.mapBox}>
                <MaterialIcons name="place" size={28} color="#ef4444" />
                <Text variant="labelSmall" style={styles.muted}>Drag map to position the red pin</Text>
              </View>
            </View>
          </BlurView>

          {/* Inputs */}
          <Card mode="outlined" style={styles.inputCard}>
            <Card.Content>
              <TextInput
                label="Address"
                placeholder="Type address"
                value={address}
                onChangeText={setAddress}
                style={{ marginBottom: 10 }}
              />
              <TextInput
                label="Site name"
                placeholder="Type site name"
                value={siteName}
                onChangeText={setSiteName}
              />
            </Card.Content>
          </Card>

          <Divider style={{ marginVertical: 8, opacity: 0 }} />

          {/* Confirm CTA */}
          <Button
            mode="contained"
            buttonColor="#f77f00"
            textColor="#fff"
            onPress={confirm}
            style={styles.confirmBtn}
          >
            Confirm
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar visible={snack} onDismiss={() => setSnack(false)} duration={1400}>Site saved</Snackbar>
    </PaperProvider>
  );
}

// ===== Styles
const styles = StyleSheet.create({
  appbar: { backgroundColor: '#03cd8c' },
  appbarTitle: { fontWeight: '800' },
  container: { padding: 16, paddingBottom: 28 },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eef3f1',
    marginBottom: 12,
  },
  cardInner: { padding: 12, backgroundColor: 'rgba(255,255,255,0.55)' },
  mapBox: { height: 180, borderRadius: 12, backgroundColor: '#fff', borderWidth: StyleSheet.hairlineWidth, borderColor: '#eef3f1', alignItems: 'center', justifyContent: 'center' },
  inputCard: { borderRadius: 14 },
  confirmBtn: { borderRadius: 999, paddingVertical: 6 },
  muted: { color: '#6b7280', marginTop: 6 },
});

/*
================ Usage tests (do not remove) ================
1) Default
<AddSiteScreen />

2) With confirm
<AddSiteScreen onConfirm={(p)=>console.log('confirm', p)} />

Route integration (expo-router):
- Place at app/sites/add.tsx so it mounts inside your Tabs layout.
- Bottom navigation is handled by your existing Tabs.
*/
