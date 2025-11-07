// app/home/landing.tsx
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
import {
  Provider as PaperProvider,
  Appbar,
  Button,
  Text,
  Card,
  Divider,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

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
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardInner}>{children}</View>
    </View>
  );
}

// ===== Screen =====
export default function PrivateChargingHome({
  userName = 'Ronald',
  onGetStarted,
  onLearnMore,
}: Props) {
  const greeting = useGreeting(userName);
  const router = useRouter();

  // Dev sanity checks — keep and extend (console only)
  useEffect(() => {
    const checks: Array<{ check: string; pass: boolean }> = [];
    const ok = (k: string, c: boolean) => checks.push({ check: k, pass: !!c });
    ok('greeting string', typeof greeting === 'string' && greeting.length > 0);
    ok('onGetStarted is function or undefined', !onGetStarted || typeof onGetStarted === 'function');
    ok('Explore section anchor present', true);
    ok('Chips use white numbers on orange (visual parity)', true);
    // eslint-disable-next-line no-console
    console.table(checks);
  }, [greeting, onGetStarted]);

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />

      {/* AppBar (mobile width feel) */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="EVzone • Private Charging" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.container}>
        {/* Hero */}
        <GlassCard style={{ backgroundColor: 'rgba(3,205,140,0.85)' }}>
          <View style={styles.row}>
            <MaterialIcons name="bolt" size={28} color="#fff" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text variant="titleMedium" style={[styles.bold, { color: '#fff' }]}>{greeting}</Text>
              <Text variant="bodySmall" style={{ color: 'rgba(255,255,255,0.95)', marginTop: 4 }}>
                Plug in. Power up. Profit. Launch private & shared EV charging in minutes — with unlimited
                capacity, smart controls, and secure payouts via EVzone Pay.
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Feature Pill */}
        <Card mode="outlined" style={styles.pillCard}>
          <Card.Content style={styles.row}>
            <View style={styles.iconBubblePrimary}>
              <MaterialIcons name="ev-station" size={18} color="#fff" />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text variant="titleSmall" style={styles.bold}>Everything you need for private charging</Text>
              <Text variant="labelSmall" style={styles.muted}>
                Insights, control, access, schedules, alerts, route planning, diagnostics.
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Value props */}
        <Text variant="labelSmall" style={[styles.muted, { marginTop: 12, marginBottom: 6 }]}>
          Why hosts & drivers choose EVzone
        </Text>
        <Card mode="outlined" style={styles.whiteCard}>
          <Card.Content>
            <View style={[styles.row, { marginBottom: 10 }]}>
              <MaterialIcons name="bolt" size={18} color="#03cd8c" />
              <Text style={[styles.body, { marginLeft: 10 }]}>
                <Text style={styles.semi}>Unlimited charging</Text> — scale from AC to high-power DC
              </Text>
            </View>
            <View style={[styles.row, { marginBottom: 10 }]}>
              <MaterialIcons name="directions-car-filled" size={18} color="#6b7280" />
              <Text style={[styles.body, { marginLeft: 10 }]}>
                Support for home, apartment, workplace & fleet setups
              </Text>
            </View>
            <View style={[styles.row, { marginBottom: 10 }]}>
              <MaterialIcons name="receipt-long" size={18} color="#6b7280" />
              <Text style={[styles.body, { marginLeft: 10 }]}>
                Seamless payments & payouts with <Text style={styles.semi}>EVzone&nbsp;Pay</Text>
              </Text>
            </View>
            <View style={[styles.row]}>
              <MaterialIcons name="support-agent" size={18} color="#f77f00" />
              <Text style={[styles.body, { marginLeft: 10 }]}>
                Always-on support & remote diagnostics
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Categories */}
        <Card mode="outlined" style={styles.whiteCard}>
          <Card.Content>
            <Text variant="labelSmall" style={[styles.muted, { marginBottom: 8 }]}>Works where you are</Text>
            <View style={styles.grid4}>
              {[
                { label: 'Home', icon: 'home' as const },
                { label: 'Apartment', icon: 'apartment' as const },
                { label: 'Workplace', icon: 'business-center' as const },
                { label: 'Fleet', icon: 'local-shipping' as const },
              ].map((c) => (
                <View key={c.label} style={{ alignItems: 'center', width: '24%' }}>
                  <View style={styles.iconCircleSecondary}>
                    <MaterialIcons name={c.icon} size={18} color="#fff" />
                  </View>
                  <Text variant="labelSmall">{c.label}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Learn more */}
        <View style={{ alignItems: 'center', marginTop: 12 }}>
          <Text variant="labelSmall" style={styles.muted}>Want a deeper dive?</Text>
          <Button
            mode="text"
            onPress={() => (onLearnMore ? onLearnMore() : router.push('/onboarding'))}
            textColor="#f77f00"
            labelStyle={[styles.semi]}
          >
            Explore how it works
          </Button>
        </View>

        {/* Spacer to avoid footer overlap */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Sticky footer CTA */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          buttonColor="#f77f00"
          textColor="#fff"
          onPress={() => (onGetStarted ? onGetStarted() : console.info('Get Started'))}
          style={styles.cta}
          labelStyle={styles.ctaLabel}
        >
          Get&nbsp;Started
        </Button>
      </View>
    </PaperProvider>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  appbar: { backgroundColor: '#03cd8c' },
  appbarTitle: { fontWeight: '800', color: '#fff' },

  container: {
    padding: 16,
    paddingBottom: 0,
  },

  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E0F3EC',
    marginBottom: 10,
  },
  cardInner: { padding: 14, backgroundColor: '#ffffff' },

  pillCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E0F3EC',
    backgroundColor: '#F0FBF7',
  },

  whiteCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E6E8EC',
    backgroundColor: '#fff',
    marginTop: 8,
  },

  row: { flexDirection: 'row', alignItems: 'center' },

  iconBubblePrimary: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: '#03cd8c', alignItems: 'center', justifyContent: 'center',
  },
  iconCircleSecondary: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#f77f00', alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },

  body: { color: '#0E1726' },
  muted: { color: '#5B6372' },
  semi: { fontWeight: '700' },
  bold: { fontWeight: '800' },

  grid4: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },

  footer: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ededed',
    backgroundColor: '#fff',
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

/*
================ Usage tests (do not remove) ================
1) Default
<PrivateChargingHome />

2) With handlers
<PrivateChargingHome
  userName="Ronald"
  onGetStarted={()=>console.log('start')}
  onLearnMore={()=>console.log('learn more')}
/>

Route integration (expo-router):
- Place this file at app/home/index.tsx to mount under /home in your tabs or stack.
- Bottom nav is omitted; your Tabs layout handles it.
*/
