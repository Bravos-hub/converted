// app/(advanced-admin)/sites/editor.tsx
// S46 • Site Editor (Advanced) — React Native (Paper)

import { View, StyleSheet } from 'react-native';
import * as React from 'react';
import { Stack } from 'expo-router';
import {
  Provider as PaperProvider,
  Appbar,
  Card,
  Text,
  Button,
  Switch,
  TextInput,
  List,
} from 'react-native-paper';

type Hours = { open: boolean; start: string; end: string };

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export default function SiteEditorAdvancedScreen() {
  const [siteName, setSiteName] = React.useState('Home Site');
  const [hours, setHours] = React.useState<Record<string, Hours>>(
    Object.fromEntries(days.map((d) => [d, { open: true, start: '08:00', end: '18:00' }]))
  );

  const update = (d: string, part: Partial<Hours>) =>
    setHours((prev) => ({ ...prev, [d]: { ...prev[d], ...part } as Hours }));

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Site editor" subtitle="layout • hours • zones" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <View style={styles.container}>
        <Card mode="outlined" style={styles.card}>
          <Card.Title title="Overview" />
          <Card.Content>
            <TextInput label="Site name" mode="outlined" value={siteName} onChangeText={setSiteName} />
          </Card.Content>
        </Card>

        <Card mode="outlined" style={styles.card}>
          <Card.Title title="Opening hours" />
          <Card.Content>
            {days.map((d) => (
              <View key={d} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Text style={{ width: 36 }}>{d}</Text>
                <Text>Open</Text>
                <Switch value={hours[d].open} onValueChange={(v) => update(d, { open: v })} />
                <TextInput
                  label="Start"
                  mode="outlined"
                  value={hours[d].start}
                  onChangeText={(v) => update(d, { start: v })}
                  style={{ flex: 1 }}
                />
                <TextInput
                  label="End"
                  mode="outlined"
                  value={hours[d].end}
                  onChangeText={(v) => update(d, { end: v })}
                  style={{ flex: 1 }}
                />
              </View>
            ))}
          </Card.Content>
        </Card>

        <Card mode="outlined" style={styles.card}>
          <Card.Title title="Zones & photos" />
          <Card.Content>
            <List.Item title="Add location marker" left={(p) => <List.Icon {...p} icon="map-marker-plus" />} />
            <List.Item title="Upload site photos" left={(p) => <List.Icon {...p} icon="image-plus" />} />
          </Card.Content>
        </Card>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button mode="outlined">Delete site</Button>
          <Button mode="contained" buttonColor="#f77f00" textColor="#fff">
            Save changes
          </Button>
        </View>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  appbar: { backgroundColor: '#03cd8c' },
  appbarTitle: { fontWeight: '800' },
  card: { borderRadius: 14, marginBottom: 10 },
});
