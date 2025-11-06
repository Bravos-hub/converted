// app/operators/detail.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native parity for S27_OperatorMarketplace.jsx (MUI → React Native Paper)
// - Uses react-native-paper for UI
// - Uses expo-blur for the glass card look
// - Bottom navigation is omitted (your Tabs layout should handle it)
//
// Dependencies to add in your project:
//   expo install expo-blur
//   npm i react-native-paper @expo/vector-icons

import { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { BlurView } from 'expo-blur';
import {
  Provider as PaperProvider,
  Appbar,
  Card,
  Text,
  Chip,
  Button,
  IconButton,
  Divider,
} from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// ===== Types =====
export type Operator = {
  name: string;
  rating: number; // 0..5
  reviews: number;
  phone: string;
  email: string;
  shift: string; // e.g. "Day"
  certifications: string[]; // 0..n labels
  coverage: string; // text region list
  pricing: string; // human-readable price
  avatarUrl?: string;
};

export type Props = {
  operator?: Partial<Operator>;
  onBack?: () => void;
  onHelp?: () => void;
  onCall?: (op: Operator) => void;
  onMessage?: (op: Operator) => void;
  onAssign?: (op: Operator) => void;
  onViewMap?: (op: Operator) => void;
};

// ===== Helpers =====
function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');
}

function Stars({ value = 0 }: { value?: number }) {
  const n = Math.round(Math.max(0, Math.min(5, value)));
  return (
    <View style={styles.rowCenter}>
      {Array.from({ length: 5 }).map((_, i) => (
        <MaterialIcons
          key={i}
          name={i < n ? 'star' : 'star-border'}
          size={18}
          color={i < n ? '#f7b500' : '#e0e0e0'}
          style={{ marginRight: 2 }}
        />
      ))}
    </View>
  );
}

// ===== Glassy card wrapper =====
const GlassCard = ({ children }: { children: React.ReactNode }) => (
  <BlurView intensity={30} tint="light" style={styles.card}>
    <View style={styles.cardInner}>{children}</View>
  </BlurView>
);

// ===== Screen =====
export default function OperatorDetailScreen({
  operator,
  onBack,
  onHelp,
  onCall,
  onMessage,
  onAssign,
  onViewMap,
}: Props) {
  const op: Operator = useMemo(
    () => ({
      name: 'Theresa Webb',
      rating: 4.9,
      reviews: 203,
      phone: '+256 777 111 222',
      email: 'theresa.webb@ops.example',
      shift: 'Day',
      certifications: ['EVSE L2 Certified', 'OCPP 1.6/2.0 Familiar', 'Electrical Safety'],
      coverage: 'Kampala, Wakiso, Mukono',
      pricing: 'UGX 30,000 per on-site visit',
      ...operator,
    }),
    [operator]
  );

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />

      {/* App bar */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="arrow-back-ios" />} onPress={() => (onBack ? onBack() : router.back())} />
        <Appbar.Content title="Operator detail" subtitle="skills • coverage • pricing" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="help-outline" />} onPress={() => onHelp?.()} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <GlassCard>
          {/* Header row */}
          <View style={[styles.rowCenter, { marginBottom: 8 }]}> 
            {/* Avatar */}
            <View style={styles.avatarBox}>
              {op.avatarUrl ? (
                <Image source={{ uri: op.avatarUrl }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarText}>{initials(op.name) || 'OP'}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="titleSmall" style={styles.bold}>{op.name}</Text>
              <View style={styles.rowCenter}>
                <Stars value={op.rating} />
                <Text variant="labelSmall" style={[styles.muted, { marginLeft: 6 }]}>({op.reviews})</Text>
              </View>
            </View>
          </View>

          {/* Certifications */}
          <View style={[styles.rowWrap, { marginBottom: 6 }]}> 
            {op.certifications?.map((c, i) => (
              <Chip key={i} icon={() => <MaterialCommunityIcons name="shield-check" size={14} />} compact style={{ marginRight: 6, marginBottom: 6 }}>
                {c}
              </Chip>
            ))}
          </View>

          {/* Meta */}
          <Text variant="bodySmall"><Text style={styles.bold}>Shift:</Text> {op.shift}</Text>
          <Text variant="bodySmall"><Text style={styles.bold}>Coverage:</Text> {op.coverage}</Text>
          <Text variant="bodySmall" style={{ marginBottom: 6 }}><Text style={styles.bold}>Pricing:</Text> {op.pricing}</Text>

          <View style={[styles.rowWrap, { marginBottom: 6 }]}> 
            <Chip icon={() => <MaterialIcons name="map" size={14} />} compact onPress={() => onViewMap?.(op)} style={{ marginRight: 6 }}>View on map</Chip>
            <Chip compact>{op.email}</Chip>
          </View>

          <Divider style={{ marginVertical: 8 }} />

          {/* Callouts */}
          <View style={styles.rowGap}>
            <Button mode="outlined" icon="message" onPress={() => onMessage?.(op)} style={styles.pill}>Message</Button>
            <Button mode="contained" buttonColor="#f77f00" textColor="#fff" icon={() => <MaterialIcons name="phone" size={18} color="#fff" />} onPress={() => onCall?.(op)} style={styles.pill}>Call</Button>
            <Button mode="contained" buttonColor="#f77f00" textColor="#fff" onPress={() => onAssign?.(op)} style={styles.pill}>Assign operator</Button>
          </View>
        </GlassCard>
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
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eef3f1',
    marginBottom: 12,
  },
  cardInner: { padding: 12, backgroundColor: 'rgba(255,255,255,0.55)' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  rowGap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  bold: { fontWeight: '800' },
  muted: { color: '#6b7280' },
  pill: { borderRadius: 999, flex: 1 },
  avatarBox: {
    width: 56, height: 56, borderRadius: 28, marginRight: 12,
    backgroundColor: '#f2f2f2', alignItems: 'center', justifyContent: 'center'
  },
  avatarText: { fontWeight: '800', fontSize: 16 },
  avatarImg: { width: 56, height: 56, borderRadius: 28 },
});

/*
================ Usage tests (do not remove) ================
1) Default
<OperatorDetailScreen />

2) With custom operator and handlers
<OperatorDetailScreen
  operator={{ name:'Jane Doe', rating:4.6, reviews:118, phone:'+256 700 123 456', email:'jane.doe@ops.example', shift:'Night', certifications:['EVSE Pro','OCPP 2.0.1','Safety'], coverage:'Kampala metro', pricing:'UGX 40,000 per visit' }}
  onCall={(op)=>console.log('call', op.phone)}
  onMessage={(op)=>console.log('dm', op.email)}
  onAssign={(op)=>console.log('assign', op.name)}
  onViewMap={(op)=>console.log('map for', op.name)}
/>

Route integration (expo-router):
- Place at app/operators/detail.tsx
- Tabs navigation is handled by your layout; this screen is single-pane.
*/
