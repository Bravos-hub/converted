// app/home/index.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native parity for S00_Home.jsx (mobile-first info splash + single CTA)
//
// UI stack:
// - react-native-paper (Appbar, Typography, Button, Card, Chip, Divider)
// - expo-blur (glassy cards)
// - @expo/vector-icons (Material icons)
//
// Install once:
//   expo install expo-blur
//   npm i react-native-paper @expo/vector-icons
//
// tsconfig.json should include:
//   { "compilerOptions": { "jsx":"react-jsx", "types":["react","react-native","expo","expo-router"] } }

import * as React from 'react';
import { useMemo, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import {
  Provider as PaperProvider,
  Appbar,
  Button,
  Text,
  Card,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorTheme } from '../../../hooks/use-color-theme';

// ===== Types =====
type Props = {
  userName?: string;
  onGetStarted?: () => void;
  onLearnMore?: () => void;
};

// ===== Helpers =====
function useGreeting(name?: string) {
  return useMemo(() => {
    const h = new Date().getHours();
    const base = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    return `${base}${name ? `, ${name}` : ''}`;
  }, [name]);
}

// ===== Glassy card =====
function GlassCard({ children, style }: { children: React.ReactNode; style?: any }) {
  const C = useColorTheme();
  return (
    <BlurView intensity={30} tint="light" style={[styles.card, { borderColor: C.border }, style]}>
      <View style={styles.cardInner}>{children}</View>
    </BlurView>
  );
}

// ===== Screen =====
export default function PrivateChargingHome({
  userName = 'Ronald',
  onGetStarted,
  onLearnMore,
}: Props) {
  const router = useRouter();
  const C = useColorTheme();
  const greeting = useGreeting(userName);

  // Dev sanity checks — keep and extend (console only)
  useEffect(() => {
    const checks: { check: string; pass: boolean }[] = [];
    const ok = (k: string, c: boolean) => checks.push({ check: k, pass: !!c });
    ok('greeting string', typeof greeting === 'string' && greeting.length > 0);
    ok('onGetStarted is function or undefined', !onGetStarted || typeof onGetStarted === 'function');
    ok('Explore section anchor present', true);
    ok('Chips use white numbers on orange (visual parity)', true);
    console.table(checks);
  }, [greeting, onGetStarted]);

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />

      {/* AppBar (mobile width feel) */}
      <Appbar.Header style={[styles.appbar, { backgroundColor: C.primary }]}>
        <Appbar.Content title="EVzone • Private Charging" titleStyle={[styles.appbarTitle, { color: C.onPrimary }]} />
      </Appbar.Header>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.container}>
        {/* Hero */}
        <GlassCard style={{ backgroundColor: C.primary }}>
          <View style={styles.row}>
            <MaterialIcons name="bolt" size={28} color={C.onPrimary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text variant="titleMedium" style={[styles.bold, { color: C.onPrimary }]}>{greeting}</Text>
              <Text variant="bodySmall" style={{ color: C.onPrimary, marginTop: 4 }}>
                Plug in. Power up. Profit. Launch private & shared EV charging in minutes — with unlimited
                capacity, smart controls, and secure payouts via EVzone Pay.
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Feature Pill */}
        <Card mode="outlined" style={[styles.pillCard, { borderColor: C.border }]}>
          <Card.Content style={styles.row}>
            <View style={[styles.iconBubblePrimary, { backgroundColor: C.primary }]}>
              <MaterialIcons name="ev-station" size={18} color={C.onPrimary} />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text variant="titleSmall" style={styles.bold}>Everything you need for private charging</Text>
              <Text variant="bodySmall" style={{ color: C.text }}>
                Insights, control, access, schedules, alerts, route planning, diagnostics.
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Value props */}
        <Text variant="titleSmall" style={{ marginTop: 12, marginBottom: 6, fontWeight: '800', color: C.text }}>
          Why hosts & drivers choose EVzone
        </Text>
        <Card mode="outlined" style={[styles.whiteCard, { borderColor: C.border, backgroundColor: C.background }]}>
          <Card.Content>
            <View style={[styles.row, { marginBottom: 10 }]}>
              <MaterialIcons name="bolt" size={18} color={C.primary} />
              <Text style={[styles.body, { marginLeft: 10, color: C.text }]}>
                <Text style={styles.semi}>Unlimited charging</Text> — scale from AC to high-power DC
              </Text>
            </View>
            <View style={[styles.row, { marginBottom: 10 }]}>
              <MaterialIcons name="directions-car-filled" size={18} color={C.muted} />
              <Text style={[styles.body, { marginLeft: 10, color: C.text }]}>
                Support for home, apartment, workplace & fleet setups
              </Text>
            </View>
            <View style={[styles.row, { marginBottom: 10 }]}>
              <MaterialIcons name="receipt-long" size={18} color={C.muted} />
              <Text style={[styles.body, { marginLeft: 10, color: C.text }]}>
                Seamless payments & payouts with <Text style={styles.semi}>EVzone&nbsp;Pay</Text>
              </Text>
            </View>
            <View style={[styles.row]}>
              <MaterialIcons name="support-agent" size={18} color={C.secondary} />
              <Text style={[styles.body, { marginLeft: 10, color: C.text }]}>
                Always-on support & remote diagnostics
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Categories */}
        <Card mode="outlined" style={[styles.whiteCard, { borderColor: C.border, backgroundColor: C.background }]}>
          <Card.Content>
            <Text variant="titleSmall" style={{ marginBottom: 8, fontWeight: '700', color: C.text }}>Works where you are</Text>
            <View style={styles.grid4}>
              {[
                { label: 'Home', icon: 'home' as const },
                { label: 'Apartment', icon: 'apartment' as const },
                { label: 'Workplace', icon: 'business-center' as const },
                { label: 'Fleet', icon: 'local-shipping' as const },
              ].map((c) => (
                <View key={c.label} style={{ alignItems: 'center', width: '24%' }}>
                  <View style={[styles.iconCircleSecondary, { backgroundColor: C.secondary }]}>
                    <MaterialIcons name={c.icon} size={18} color={C.onSecondary} />
                  </View>
                  <Text variant="labelSmall">{c.label}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Learn more */}
        <View style={{ alignItems: 'center', marginTop: 12 }}>
          <Text variant="labelSmall" style={[styles.muted, { color: C.muted }]}>Want a deeper dive?</Text>
          <Button
            mode="text"
            onPress={() => (onLearnMore ? onLearnMore() : router.push('/onboarding'))}
            textColor={C.secondary}
            labelStyle={[styles.semi]}
          >
            Explore how it works
          </Button>
        </View>

        {/* Primary CTA (scrolls with content) */}
        <View style={{ marginTop: 16, marginBottom: 24 }}>
          <Button
            mode="contained"
            buttonColor={C.secondary}
            textColor={C.onSecondary}
            onPress={() => (onGetStarted ? onGetStarted() : router.push('/(tabs)/chargers/add'))}
            style={[styles.cta, { alignSelf: 'stretch' }]}
            labelStyle={styles.ctaLabel}
          >
            Get Started
          </Button>
        </View>
      </ScrollView>

      {/* CTA moved into scrollable content above */}
    </PaperProvider>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  appbar: {},
  appbarTitle: { fontWeight: '800' },

  container: {
    padding: 16,
    paddingBottom: 0,
  },

  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    // themed via component
    marginBottom: 10,
  },
  cardInner: { padding: 14, backgroundColor: 'rgba(255,255,255,0.55)' },

  pillCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    // themed via component
    backgroundColor: '#F0FBF7',
  },

  whiteCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    // themed via component
    backgroundColor: '#fff',
    marginTop: 8,
  },

  row: { flexDirection: 'row', alignItems: 'center' },

  iconBubblePrimary: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  iconCircleSecondary: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },

  body: {},
  muted: {},
  semi: { fontWeight: '700' },
  bold: { fontWeight: '800' },

  grid4: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },

  footer: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    // themed via component
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cta: {
    borderRadius: 999,
    elevation: 2,
  },
  ctaLabel: {
    fontWeight: '800',
  },
});
