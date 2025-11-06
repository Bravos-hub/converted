// app/chargers/qr-poster.tsx
// S26B • QR Poster — React Native implementation

import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Provider as PaperProvider, Appbar, Card, Text, Button, Chip } from 'react-native-paper';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  site?: string;
  code?: string;
  onDownload?: (info: { site: string; code: string }) => void;
  onPrint?: (info: { site: string; code: string }) => void;
};

export default function QrPosterScreen({ site = 'Home Charger', code = 'EVZ-QR-1023', onDownload, onPrint }: Props) {
  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />

      <Appbar.Header style={styles.appbar}>
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="arrow-back-ios" />} onPress={() => router.back()} />
        <Appbar.Content title="QR Poster" subtitle="print • share" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <View style={styles.container}>
        <Card mode="outlined" style={{ borderRadius: 14 }}>
          <Card.Content style={{ alignItems: 'center' }}>
            <Text variant="titleSmall" style={{ fontWeight: '800' }}>
              {site}
            </Text>
            <View style={styles.qr}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>QR</Text>
            </View>
            <Text variant="labelSmall" style={{ opacity: 0.7 }}>
              Scan to start a charging session
            </Text>
            <Chip style={{ marginTop: 6 }}>{code}</Chip>
          </Card.Content>
        </Card>

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 12 }}>
          <Button
            mode="contained"
            buttonColor="#f77f00"
            textColor="#fff"
            icon="download"
            onPress={() => onDownload?.({ site, code })}
          >
            Download PNG
          </Button>
          <Button mode="outlined" icon="printer" onPress={() => onPrint?.({ site, code })}>
            Print
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
  qr: {
    width: 200,
    height: 200,
    borderRadius: 10,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
});
