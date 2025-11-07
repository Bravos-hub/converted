// app/chargers/schedules.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native parity for S20_Schedules.jsx (MUI → React Native Paper)
//
// Dependencies:
//   expo install expo-blur
//   npm i react-native-paper @expo/vector-icons

import * as React from 'react';
import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Provider as PaperProvider,
  Appbar,
  Button,
  Card,
  Chip,
  IconButton,
  List,
  Switch,
  Text,
  Divider,
  Snackbar,
} from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

type Schedule = {
  id: string;
  name: string;
  start: string;  // "22:00"
  end: string;    // "06:00"
  target: number; // %
  days: string[]; // ['Mon','Tue',...]
  enabled: boolean;
};

type Props = {
  onBack?: () => void;
  onHelp?: () => void;
  onSave?: (schedules: Schedule[]) => void;
  onAdd?: () => void;
  onEdit?: (s: Schedule) => void;
  onToggle?: (s: Schedule) => void;
  onDelete?: (s: Schedule) => void;
};

// ---------- Glassy card
const GlassCard = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.card}>
    <View style={styles.cardInner}>{children}</View>
  </View>
);

// ---------- Row
function ScheduleRow({
  s,
  onEdit,
  onToggle,
  onDelete,
}: {
  s: Schedule;
  onEdit?: (s: Schedule) => void;
  onToggle?: (s: Schedule) => void;
  onDelete?: (s: Schedule) => void;
}) {
  return (
    <Card mode="outlined" style={styles.rowCard} onPress={() => onEdit?.(s)}>
      <Card.Content>
        <View style={styles.rowHeader}>
          <Text variant="titleSmall" style={styles.bold}>{s.name}</Text>
          <View style={styles.rowTrailing}>
            <IconButton icon="pencil-outline" size={18} onPress={() => onEdit?.(s)} />
            <IconButton icon="delete-outline" size={18} onPress={() => onDelete?.(s)} />
            <View style={styles.rowCenter}>
              <Switch value={s.enabled} onValueChange={() => onToggle?.(s)} />
              <Text style={styles.muted}>{s.enabled ? 'On' : 'Off'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.chipsRow}>
          <Chip compact icon={() => <MaterialIcons name="schedule" size={14} />}>
            {s.start} → {s.end}
          </Chip>
          <Chip compact icon={() => <MaterialIcons name="bolt" size={14} />}>
            Target {s.target}%
          </Chip>
          <Chip compact>{s.days.join(', ')}</Chip>
        </View>
      </Card.Content>
    </Card>
  );
}

// ---------- Screen
export default function ChargeSchedulesScreen({
  onBack,
  onHelp,
  onSave,
  onAdd,
  onEdit,
  onToggle,
  onDelete,
}: Props) {
  const [schedules, setSchedules] = useState<Schedule[]>([
    { id: '1', name: 'Weekdays night', start: '22:00', end: '06:00', target: 90, days: ['Mon','Tue','Wed','Thu','Fri'], enabled: true },
    { id: '2', name: 'Weekend morning', start: '07:00', end: '09:00', target: 80, days: ['Sat','Sun'], enabled: false },
  ]);
  const [snack, setSnack] = useState(false);

  const handleToggle = (s: Schedule) => {
    setSchedules(prev => prev.map(x => x.id === s.id ? { ...x, enabled: !x.enabled } : x));
    onToggle?.(s);
  };
  const handleDelete = (s: Schedule) => {
    setSchedules(prev => prev.filter(x => x.id !== s.id));
    onDelete?.(s);
  };
  const handleSaveAll = () => {
    onSave ? onSave(schedules) : console.log('Save schedules', schedules);
    setSnack(true);
  };

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <Appbar.Header style={styles.appbar}>
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="arrow-back-ios" />} onPress={() => router.back()} />
        <Appbar.Content title="Charge schedules" subtitle="automate off-peak charging" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="help-outline" />} onPress={onHelp} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <GlassCard>
          <Text variant="titleSmall" style={styles.bold}>My schedules</Text>
          <Text variant="labelSmall" style={styles.muted}>Tap a schedule to edit</Text>
        </GlassCard>

        <List.Section>
          {schedules.map(s => (
            <View key={s.id} style={{ marginBottom: 8 }}>
              <ScheduleRow
                s={s}
                onEdit={onEdit}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            </View>
          ))}
        </List.Section>

        <Divider style={{ marginVertical: 8 }} />

        <View style={styles.rowGap}>
          <Button
            mode="outlined"
            icon="plus-circle-outline"
            onPress={() => onAdd ? onAdd() : console.log('Open schedule editor (create)')}
            style={styles.pill}
          >
            Add schedule
          </Button>
          <Button
            mode="contained"
            icon="content-save"
            buttonColor="#f77f00"
            textColor="#fff"
            onPress={handleSaveAll}
            style={styles.pill}
          >
            Save all
          </Button>
        </View>
      </ScrollView>

      <Snackbar visible={snack} onDismiss={() => setSnack(false)} duration={1500}>
        Schedules saved!
      </Snackbar>
    </PaperProvider>
  );
}

// ---------- Styles
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
  cardInner: { padding: 12, backgroundColor: '#ffffff' },
  rowCard: { borderRadius: 12 },
  rowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowTrailing: { flexDirection: 'row', alignItems: 'center' },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  bold: { fontWeight: '800' },
  muted: { color: '#6b7280' },
  pill: { borderRadius: 999, flex: 1 },
});

/*
================ Usage tests (do not remove) ================
1) Default
<ChargeSchedulesScreen />

2) Wire callbacks
<ChargeSchedulesScreen
  onAdd={()=>console.log('add')}
  onEdit={(s)=>console.log('edit', s)}
  onToggle={(s)=>console.log('toggle', s)}
  onDelete={(s)=>console.log('delete', s)}
  onSave={(all)=>console.log('save', all)}
/>

Route integration (expo-router):
- Place at app/chargers/schedules.tsx
- Bottom tabs handled by your Tabs layout (omitted here by design)
*/
