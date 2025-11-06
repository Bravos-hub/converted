// app/onboarding/permissions.tsx
// Onboarding • Step 3 — Permissions & next steps

import * as React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { Provider as PaperProvider, Appbar, Card, Text, Button, Checkbox } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorTheme } from '../../hooks/use-color-theme';

export default function OnboardingPermissions() {
  const C = useColorTheme();
  const [agree, setAgree] = React.useState(true);
  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <Appbar.Header style={{ backgroundColor: C.primary }}>
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="arrow-back-ios" />} onPress={() => router.back()} />
        <Appbar.Content title="You're all set" titleStyle={{ fontWeight: '800', color: C.onPrimary }} color={C.onPrimary} />
        <Appbar.Action icon={(p) => <MaterialIcons {...p} name="close" />} onPress={() => router.replace('/')} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <Card mode="outlined" style={[styles.whiteCard, { borderColor: C.border, backgroundColor: C.background }]}> 
          <Card.Content>
            <Text variant="titleSmall" style={{ fontWeight: '800' }}>A couple of quick things</Text>
            <View style={{ height: 8 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Checkbox status={agree ? 'checked' : 'unchecked'} onPress={() => setAgree(a => !a)} />
              <Text variant="bodySmall">I agree to the Terms of Service and Privacy Policy</Text>
            </View>
            <View style={{ height: 8 }} />
            <Text variant="bodySmall" style={{ color: C.muted }}>
              To scan QR codes, the camera permission may be requested in the next step.
            </Text>
          </Card.Content>
        </Card>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <Button mode="outlined" onPress={() => router.replace('/')} style={{ flex: 1 }}>Maybe later</Button>
          <Button mode="contained" disabled={!agree} buttonColor={C.secondary} textColor={C.onSecondary} onPress={() => router.replace('/(tabs)/chargers/add')} style={{ flex: 1 }}>Continue</Button>
        </View>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 24 },
  whiteCard: { borderRadius: 14, overflow: 'hidden' },
});
