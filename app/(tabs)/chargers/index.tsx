// app/(getting-started)/chargers/index.tsx
// S03 • My Chargers — React Native (Expo, TypeScript) implementation

import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, Link } from 'expo-router';
import {
  Provider as PaperProvider,
  Appbar,
  Card,
  Text,
  Chip,
  Button,
  List,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorTheme } from '../../../hooks/use-color-theme';

type Charger = {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'busy';
  connectors: number;
};

const initialChargers: Charger[] = [
  { id: 'EVZ-UG-KLA-000123', name: 'Home — AC22', location: 'Bugolobi', status: 'online', connectors: 2 },
  { id: 'EVZ-UG-KLA-000377', name: 'Office — DC90', location: 'Lugogo By-pass', status: 'busy', connectors: 1 },
  { id: 'EVZ-UG-KLA-000522', name: 'Guest — AC22', location: 'Ntinda', status: 'offline', connectors: 2 },
];

export default function MyChargersScreen() {
  const [items] = React.useState<Charger[]>(initialChargers);
  const C = useColorTheme();

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />

      <Appbar.Header style={[styles.appbar, { backgroundColor: C.primary }]}>
        <Appbar.Content title="My chargers" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <View style={styles.container}>
        {items.map((c) => (
          <Card key={c.id} mode="outlined" style={styles.card}>
            <Card.Title
              title={c.name}
              subtitle={`${c.location} • ${c.id}`}
              left={(p) => <MaterialCommunityIcons {...p} name="ev-station" size={24} />}
              right={() => (
                <Chip icon={c.status === 'online' ? 'check' : c.status === 'busy' ? 'timer-sand' : 'close'}>
                  {c.status}
                </Chip>
              )}
            />
            <Card.Content>
              <Text>Connectors: {c.connectors}</Text>
            </Card.Content>
            <Card.Actions>
              <Link href="/(tabs)/chargers/details" asChild>
                <Button mode="outlined">Details</Button>
              </Link>
              <Link href="/(tabs)/chargers/manage" asChild>
                <Button mode="outlined">Manage</Button>
              </Link>
            </Card.Actions>
          </Card>
        ))}

        <List.Section>
          <List.Subheader>Quick actions</List.Subheader>
          <Link href="/(tabs)/chargers/add" asChild>
            <Button icon="plus" mode="contained" buttonColor={C.secondary} textColor={C.onSecondary}>
              Add charger
            </Button>
          </Link>
        </List.Section>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  appbar: {},
  appbarTitle: { fontWeight: '800' },
  card: { marginBottom: 10, borderRadius: 14 },
});
