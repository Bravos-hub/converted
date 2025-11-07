import * as React from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Provider as PaperProvider,
  Appbar,
  Text,
  Button,
  Chip,
  List,
  Switch,
  Divider,
  Snackbar,
  SegmentedButtons,
} from 'react-native-paper';
import { useColorTheme } from '../../../hooks/use-color-theme';
import {
  accountProfile,
  notificationPreferences as initialPrefs,
  supportShortcuts,
  accessUsers,
  accessPolicies,
} from '../../../constants/mock-data';

const languages = ['English', 'Luganda', 'French'] as const;
const currencies = ['UGX', 'KES', 'USD'] as const;

export default function SettingsScreen() {
  const C = useColorTheme();
  const [prefs, setPrefs] = useState(initialPrefs);
  const [language, setLanguage] = useState<typeof languages[number]>(accountProfile.language as typeof languages[number]);
  const [currency, setCurrency] = useState<typeof currencies[number]>(accountProfile.currency as typeof currencies[number]);
  const [snack, setSnack] = useState<string | null>(null);

  const toggle = (key: keyof typeof prefs) => setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <Appbar.Header style={{ backgroundColor: C.primary }}>
        <Appbar.Content title="Settings" titleStyle={styles.bold} subtitle="Account • preferences • access" />
        <Appbar.Action icon="account" onPress={() => router.push('/(tabs)/settings/support')} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={[styles.bold, { fontSize: 18 }]}>{accountProfile.name}</Text>
              <Text style={{ color: C.muted }}>{accountProfile.email}</Text>
              <Chip icon="badge-account" style={{ marginTop: 6 }} mode="outlined">
                {accountProfile.plan}
              </Chip>
            </View>
            <Button mode="outlined" icon="pencil" onPress={() => setSnack('Profile edit coming soon')}>
              Edit
            </Button>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={[styles.bold, styles.cardTitle]}>Notifications</Text>
          {(
            [
              { label: 'Push', key: 'push' },
              { label: 'SMS', key: 'sms' },
              { label: 'Email', key: 'email' },
              { label: 'Offline alerts', key: 'offlineAlerts' },
              { label: 'Weekly digest', key: 'weeklyDigest' },
            ] as const
          ).map((item) => (
            <View key={item.key} style={styles.listRow}>
              <Text>{item.label}</Text>
              <Switch value={prefs[item.key]} onValueChange={() => toggle(item.key)} />
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={[styles.bold, styles.cardTitle]}>Language & currency</Text>
          <Text style={{ color: C.muted }}>Language</Text>
          <SegmentedButtons
            style={{ marginVertical: 8 }}
            value={language}
            onValueChange={(value) => {
              setLanguage(value as typeof language);
              setSnack(`Language set to ${value}`);
            }}
            buttons={languages.map((lng) => ({ value: lng, label: lng }))}
          />
          <Divider style={{ marginVertical: 8 }} />
          <Text style={{ color: C.muted }}>Currency</Text>
          <SegmentedButtons
            value={currency}
            onValueChange={(value) => {
              setCurrency(value as typeof currency);
              setSnack(`Currency set to ${value}`);
            }}
            buttons={currencies.map((cur) => ({ value: cur, label: cur }))}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={[styles.bold, styles.cardTitle]}>Access control</Text>
            <Button mode="text" onPress={() => router.push('/(tabs)/chargers/access')} icon="chevron-right">
              Manage
            </Button>
          </View>
          {accessUsers.map((user) => (
            <List.Item
              key={user.id}
              title={`${user.name} • ${user.role}`}
              description={`${user.methods.join(', ')} • ${user.vehicles} vehicles`}
              left={(props) => <List.Icon {...props} icon="account" />}
              onPress={() => router.push('/(tabs)/chargers/user-access-vehicles')}
            />
          ))}
          <Divider style={{ marginVertical: 12 }} />
          <View style={styles.rowGapWrap}>
            {accessPolicies.map((policy) => (
              <Chip key={policy.id} icon={policy.enabled ? 'check' : 'close'} mode="outlined">
                {policy.label}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={[styles.bold, styles.cardTitle]}>Support & help</Text>
          {supportShortcuts.map((shortcut) => (
            <Button
              key={shortcut.id}
              mode="outlined"
              icon={shortcut.icon}
              style={{ marginBottom: 8 }}
              onPress={() => setSnack(`${shortcut.label} coming soon`)}
            >
              {shortcut.label}
            </Button>
          ))}
          <Button mode="text" icon="message" onPress={() => router.push('/(tabs)/settings/support')}>
            Contact support
          </Button>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={1600}>
        {snack}
      </Snackbar>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eef3f1',
  },
  bold: { fontWeight: '800' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowGapWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  cardTitle: { fontSize: 16, marginBottom: 8 },
});
