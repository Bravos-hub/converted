// app/(advanced-admin)/operators/marketplace.tsx
// S27 • Operator Marketplace — React Native (Paper)

import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Provider as PaperProvider, Appbar, Card, Text, Button, Chip, Avatar } from 'react-native-paper';

type Operator = {
  name: string;
  rating: number;
  reviews: number;
  phone: string;
  email: string;
  shift: string;
  certifications: string[];
  coverage: string;
  pricing: string;
};

const sample: Operator = {
  name: 'Theresa Webb',
  rating: 4.9,
  reviews: 203,
  phone: '+256 777 111 222',
  email: 'theresa.webb@ops.example',
  shift: 'Day',
  certifications: ['EVSE L2 Certified', 'OCPP 1.6/2.0 Familiar', 'Electrical Safety'],
  coverage: 'Kampala, Wakiso, Mukono',
  pricing: 'UGX 30,000 per on-site visit',
};

export default function OperatorMarketplaceScreen() {
  const op = sample;
  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Operator detail" subtitle="skills • coverage • pricing" titleStyle={styles.appbarTitle} />
      </Appbar.Header>
      <View style={styles.container}>
        <Card mode="outlined" style={styles.card}>
          <Card.Title
            title={op.name}
            subtitle={`${op.rating} • ${op.reviews} reviews`}
            left={(p) => <Avatar.Text {...p} label={op.name[0]} />}
          />
          <Card.Content>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {op.certifications.map((c) => (
                <Chip key={c}>{c}</Chip>
              ))}
            </View>
            <Text>Shift: {op.shift}</Text>
            <Text>Coverage: {op.coverage}</Text>
            <Text style={{ marginBottom: 8 }}>Pricing: {op.pricing}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Chip icon="map">View on map</Chip>
              <Chip>{op.email}</Chip>
            </View>
          </Card.Content>
          <Card.Actions>
            <Button icon="message">Message</Button>
            <Button mode="contained" icon="phone" buttonColor="#f77f00" textColor="#fff">
              Call
            </Button>
            <Button mode="contained" buttonColor="#f77f00" textColor="#fff">
              Assign operator
            </Button>
          </Card.Actions>
        </Card>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  appbar: { backgroundColor: '#03cd8c' },
  appbarTitle: { fontWeight: '800' },
  card: { borderRadius: 14 },
});
