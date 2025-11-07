// app/onboarding/features.tsx
// Onboarding • Step 2 — Key Features

import * as React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { Provider as PaperProvider, Appbar, Card, Text, Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorTheme } from '../../hooks/use-color-theme';

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardInner}>{children}</View>
    </View>
  );
}

export default function OnboardingFeatures() {
  const C = useColorTheme();
  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <Appbar.Header style={{ backgroundColor: C.primary }}>
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="arrow-back-ios" />} onPress={() => router.back()} />
        <Appbar.Content title="How it works" titleStyle={{ fontWeight: '800', color: C.onPrimary }} color={C.onPrimary} />
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="close" />} onPress={() => router.replace('/')} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <GlassCard>
          <View style={styles.row}>
            <MaterialIcons name="qr-code-scanner" size={20} color={C.primary} />
            <Text style={[styles.bold, { marginLeft: 8 }]}>Scan or add manually</Text>
          </View>
          <Text variant="bodySmall" style={{ marginTop: 6 }}>
            Connect a charger by scanning its QR or entering model & serial.
          </Text>
        </GlassCard>

        <GlassCard>
          <View style={styles.row}>
            <MaterialIcons name="groups" size={20} color={C.secondary} />
            <Text style={[styles.bold, { marginLeft: 8 }]}>Control access</Text>
          </View>
          <Text variant="bodySmall" style={{ marginTop: 6 }}>
            Allow charging for family, employees, guests, or the public.
          </Text>
        </GlassCard>

        <GlassCard>
          <View style={styles.row}>
            <MaterialIcons name="receipt-long" size={20} color={C.muted} />
            <Text style={[styles.bold, { marginLeft: 8 }]}>Get paid</Text>
          </View>
          <Text variant="bodySmall" style={{ marginTop: 6 }}>
            Enable EVzone Pay to set pricing, accept payments and withdraw.
          </Text>
        </GlassCard>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <Button mode="outlined" onPress={() => router.replace('/')} style={{ flex: 1 }}>Skip</Button>
          <Button mode="contained" buttonColor={C.secondary} textColor={C.onSecondary} onPress={() => router.push('/onboarding/permissions')} style={{ flex: 1 }}>Next</Button>
        </View>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center' },
  card: { borderRadius: 14, overflow: 'hidden', marginBottom: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: '#eef3f1' },
  cardInner: { padding: 14, backgroundColor: '#ffffff' },
  bold: { fontWeight: '800' },
});

