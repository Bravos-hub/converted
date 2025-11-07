// app/chargers/fault-detail.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native parity for S22_FaultDetail.jsx (inspect • acknowledge • resolve)
//
// Dependencies:
//   expo install expo-blur
//   npm i react-native-paper @expo/vector-icons

import * as React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Provider as PaperProvider,
  Appbar,
  Button,
  Card,
  Chip,
  Divider,
  Text,
} from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

export type Fault = {
  code: string;
  title: string;
  severity: 'Critical' | 'Warning' | 'Info' | string;
  time: string;
  connector: string;
  description: string;
  recommendations: string[];
  raw: string;
};

type Props = {
  fault?: Partial<Fault>;
  onBack?: () => void;
  onHelp?: () => void;
  onResolve?: (f: Fault) => void;
  onAcknowledge?: (f: Fault) => void;
  onExport?: (f: Fault) => void;
};

const DEFAULT_FAULT: Fault = {
  code: 'E101',
  title: 'Overcurrent detected',
  severity: 'Critical',
  time: '2025-10-18 14:22',
  connector: 'Connector 1',
  description: 'Current exceeded safe operating threshold.',
  recommendations: [
    'Check cable and connector for damage',
    'Reduce charging power',
    'Restart the charger',
  ],
  raw: '{"code":"E101","amp":112}',
};

export default function FaultDetailScreen({
  fault,
  onBack,
  onHelp,
  onResolve,
  onAcknowledge,
  onExport,
}: Props) {
  const f: Fault = { ...DEFAULT_FAULT, ...fault } as Fault;

  const severityChipStyle = () => {
    switch (f.severity) {
      case 'Critical':
        return { backgroundColor: '#ef4444' };
      case 'Warning':
        return { backgroundColor: '#f59e0b' };
      default:
        return { backgroundColor: '#e5e7eb' };
    }
  };

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Appbar */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.Action
          icon={(p) => <MaterialIcons {...p} name="arrow-back-ios" />}
          onPress={() => (onBack ? onBack() : router.back())}
        />
        <Appbar.Content
          title="Fault detail"
          subtitle="inspect • acknowledge • resolve"
          titleStyle={styles.appbarTitle}
        />
        <Appbar.Action
          icon={(p) => <MaterialIcons {...p} name="help-outline" />}
          onPress={onHelp}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Glassy card */}
        <View style={styles.card}>
          <View style={styles.cardInner}>
            <View style={styles.rowCenter}>
              <MaterialCommunityIcons name="bug" size={18} color="#ef4444" />
              <Text variant="titleSmall" style={[styles.bold, { marginLeft: 8 }]}>
                {f.code} — {f.title}
              </Text>
            </View>

            <View style={[styles.rowCenter, { marginTop: 8 }]}>
              <Chip compact style={[{ alignSelf: 'flex-start' }, severityChipStyle()]}>
                <Text style={{ color: '#fff' }}>{f.severity}</Text>
              </Chip>
            </View>

            <Text variant="labelSmall" style={[styles.muted, { marginTop: 4 }]}>
              {f.time} • {f.connector}
            </Text>

            <Divider style={{ marginVertical: 12 }} />

            <Text variant="bodySmall" style={styles.body}>
              {f.description}
            </Text>

            <Text variant="titleSmall" style={[styles.bold, { marginTop: 12 }]}>
              Recommendations
            </Text>
            <View style={{ marginTop: 4 }}>
              {f.recommendations.map((r, i) => (
                <Text key={i} variant="bodySmall">
                  • {r}
                </Text>
              ))}
            </View>

            <Button
              mode="text"
              icon="download"
              onPress={() => onExport?.(f)}
              style={{ marginTop: 6, alignSelf: 'flex-start' }}
            >
              Export log
            </Button>

            <Text variant="labelSmall" style={[styles.muted, { marginTop: 8 }]}>
              Raw payload
            </Text>
            <Card mode="outlined" style={styles.rawCard}>
              <Text
                variant="bodySmall"
                selectable
                style={styles.mono}
              >
                {f.raw}
              </Text>
            </Card>

            {/* Footer actions */}
            <View style={[styles.rowGap, { marginTop: 12 }]}>
              <Button
                mode="outlined"
                icon="history"
                onPress={() => onAcknowledge?.(f)}
                style={styles.pill}
              >
                Acknowledge
              </Button>
              <Button
                mode="contained"
                icon="check-circle-outline"
                buttonColor="#f77f00"
                textColor="#fff"
                onPress={() => onResolve?.(f)}
                style={[styles.pill, { marginLeft: 'auto' }]}
              >
                Resolve
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  appbar: { backgroundColor: '#03cd8c' },
  appbarTitle: { fontWeight: '800' },
  container: { padding: 16, paddingBottom: 60 },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eef3f1',
  },
  cardInner: { padding: 12, backgroundColor: '#ffffff' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bold: { fontWeight: '800' },
  muted: { color: '#6b7280' },
  body: { color: '#111827' },
  pill: { borderRadius: 999 },
  rawCard: { marginTop: 6, backgroundColor: '#fafafa' },
  mono: {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: 12,
  },
});

/*
================ Usage tests (do not remove) ================
1) Default
<FaultDetailScreen />

2) With handlers
<FaultDetailScreen
  onAcknowledge={(f)=>console.log('ack', f)}
  onResolve={(f)=>console.log('resolve', f)}
  onExport={(f)=>console.log('export', f)}
/>

Route integration (expo-router):
- Place at app/chargers/fault-detail.tsx
- Bottom navigation is handled by your Tabs layout (intentionally omitted here)
*/
