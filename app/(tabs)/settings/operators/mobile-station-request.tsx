// app/(advanced-admin)/operators/mobile-station-request.tsx
// S47 • Mobile Station Request — React Native (Paper)

import { View, StyleSheet } from 'react-native';
import * as React from 'react';
import { Stack } from 'expo-router';
import {
  Provider as PaperProvider,
  Appbar,
  Card,
  Text,
  Button,
  Chip,
  List,
  Switch,
} from 'react-native-paper';

type Request = {
  id: string;
  customer: string;
  location: string;
  energy: number;
  eta: string;
  status: 'Queued' | 'Accepted' | 'Dispatched' | 'Completed';
};

const seed: Record<string, Request[]> = {
  st1: [
    { id: 'ms1', customer: 'Tim', location: 'Ntinda', energy: 20, eta: '14:30', status: 'Queued' },
    { id: 'ms2', customer: 'Eve', location: 'Bukoto', energy: 15, eta: '15:10', status: 'Accepted' },
  ],
  st2: [{ id: 'ms3', customer: 'Sara', location: 'Nalya', energy: 10, eta: '16:05', status: 'Dispatched' }],
};

export default function MobileStationRequestScreen() {
  const [siteId] = React.useState('st1');
  const [online, setOnline] = React.useState(true);
  const queue = seed[siteId] || [];

  const changeStatus = (r: Request, next: Request['status']) => {
    r.status = next;
  };

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Mobile station requests" subtitle="queue • route • dispatch" titleStyle={styles.appbarTitle} />
      </Appbar.Header>
      <View style={styles.container}>
        <Card mode="outlined" style={styles.card}>
          <Card.Title title="My sites" subtitle={siteId} />
          <Card.Content>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Text>Online</Text>
              <Switch value={online} onValueChange={setOnline} />
              <Chip>Queue: {queue.length}</Chip>
            </View>
          </Card.Content>
        </Card>

        <List.Section>
          {queue.map((r) => (
            <Card key={r.id} mode="outlined" style={styles.card}>
              <Card.Content>
                <Text variant="titleSmall" style={{ fontWeight: '800' }}>
                  {r.customer} • {r.energy} kWh
                </Text>
                <Text variant="labelSmall" style={{ opacity: 0.7 }}>
                  {r.location} • ETA {r.eta}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                  <Chip>{r.status}</Chip>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  {r.status === 'Queued' && (
                    <Button mode="outlined" onPress={() => changeStatus(r, 'Accepted')}>
                      Accept
                    </Button>
                  )}
                  {r.status === 'Queued' && (
                    <Button mode="outlined" onPress={() => changeStatus(r, 'Completed')}>
                      Reject
                    </Button>
                  )}
                  {r.status === 'Accepted' && (
                    <Button mode="outlined" onPress={() => changeStatus(r, 'Dispatched')}>
                      Dispatch
                    </Button>
                  )}
                  {r.status === 'Dispatched' && (
                    <>
                      <Button mode="outlined">Route</Button>
                      <Button mode="contained" buttonColor="#03cd8c" textColor="#fff" onPress={() => changeStatus(r, 'Completed')}>
                        Complete
                      </Button>
                    </>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))}
        </List.Section>
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
