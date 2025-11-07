// app/onboarding/index.tsx
// Onboarding • Step 1 — Welcome

import * as React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { Provider as PaperProvider, Appbar, Button, Card, Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorTheme } from '../../hooks/use-color-theme';

function GlassCard({ children, style }: { children: React.ReactNode; style?: any }) {
  const C = useColorTheme();
  return (
    <View style={[styles.card, { borderColor: C.border }, style]}>
      <View style={styles.cardInner}>{children}</View>
    </View>
  );
}

export default function OnboardingWelcome() {
  const C = useColorTheme();
  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />

      <Appbar.Header style={{ backgroundColor: C.primary }}>
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="arrow-back-ios" />} onPress={() => router.back()} />
        <Appbar.Content title="Welcome" titleStyle={{ fontWeight: '800', color: C.onPrimary }} color={C.onPrimary} />
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="close" />} onPress={() => router.replace('/')} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <GlassCard style={{ backgroundColor: 'rgba(3,205,140,0.08)' }}>
          <View style={{ alignItems: 'center' }}>
            <View style={styles.heroIcon}>
              <MaterialIcons name="bolt" size={36} color={C.onPrimary} />
            </View>
            <Text variant="titleMedium" style={styles.bold}>Power up with EVzone</Text>
            <Text variant="bodySmall" style={{ textAlign: 'center', color: C.muted, marginTop: 6 }}>
              Set up chargers, control access, track sessions, and get paid.
            </Text>
          </View>
        </GlassCard>

        <Card mode="outlined" style={[styles.whiteCard, { borderColor: C.border, backgroundColor: C.background }]}> 
          <Card.Content>
            <View style={styles.row}>
              <MaterialIcons name="ev-station" size={18} color={C.primary} />
              <Text style={[styles.body, { marginLeft: 10, color: C.text }]}>Add your first charger in minutes</Text>
            </View>
            <View style={[styles.row, { marginTop: 8 }]}>
              <MaterialIcons name="lock" size={18} color={C.secondary} />
              <Text style={[styles.body, { marginLeft: 10, color: C.text }]}>Choose who can access and when</Text>
            </View>
            <View style={[styles.row, { marginTop: 8 }]}>
              <MaterialIcons name="payments" size={18} color={C.muted} />
              <Text style={[styles.body, { marginLeft: 10, color: C.text }]}>Enable payouts with EVzone Pay</Text>
            </View>
          </Card.Content>
        </Card>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <Button mode="outlined" onPress={() => router.replace('/')} style={{ flex: 1 }}>Skip</Button>
          <Button mode="contained" buttonColor={C.secondary} textColor={C.onSecondary} onPress={() => router.push('/onboarding/features')} style={{ flex: 1 }}>Next</Button>
        </View>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 24 },
  card: { borderRadius: 14, overflow: 'hidden', marginBottom: 10, borderWidth: StyleSheet.hairlineWidth },
  cardInner: { padding: 16, backgroundColor: '#ffffff' },
  whiteCard: { borderRadius: 14, overflow: 'hidden', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  body: {},
  bold: { fontWeight: '800' },
  heroIcon: { width: 64, height: 64, borderRadius: 18, backgroundColor: '#03cd8c', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
});

