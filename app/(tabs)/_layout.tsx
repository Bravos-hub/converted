import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '../../components/haptic-tab';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { ChargingSessionProvider } from '../../hooks/use-charging-sessions';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <ChargingSessionProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        {/* Hide non-tab groups that live under the tabs layout */}
        <Tabs.Screen
          name="chargers"
          options={{
            title: 'Chargers',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="bolt.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="sessions"
          options={{
            title: 'Sessions',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.fill" color={color} />,
          }}
        />
        {/** Nested stacks handle deeper routes so they don't appear as tabs */}
        <Tabs.Screen
          name="wallet"
          options={{
            title: 'Wallet',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="wallet.pass" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
          }}
        />
        {/* Hide non-tab groups that live under the tabs layout */}
        <Tabs.Screen name="home" options={{ href: null }} />
        <Tabs.Screen name="wallets" options={{ href: null }} />
      </Tabs>
    </ChargingSessionProvider>
  );
}
