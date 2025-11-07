import * as React from 'react';
import { router } from 'expo-router';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { Provider as PaperProvider, MD3LightTheme as DefaultTheme, Appbar, Text, Button, Chip } from 'react-native-paper';

const theme = { ...DefaultTheme, colors:{ ...DefaultTheme.colors, primary:'#03cd8c', secondary:'#f77f00', background:'#f7f9f8', surface:'#ffffff' }, roundness:14 };

export type AggregatorBridgeProps = { onBack?: ()=>void; onBell?: ()=>void; onNavChange?: (v:number)=>void; onOpenAggregator?: ()=>void; onReadDocs?: ()=>void };

function GlassCard({ children, style }:{ children: React.ReactNode; style?: any }){
  return (
    <View style={[styles.blurCard, style]}>
      <View style={styles.blurInner}>{children}</View>
    </View>
  );
}

export default function AggregatorBridge({ onBack, onBell, onNavChange, onOpenAggregator, onReadDocs }: AggregatorBridgeProps){
  return (
    <PaperProvider theme={theme}>
      <View style={styles.root}>
        <Appbar.Header mode="small" elevated style={{ backgroundColor: theme.colors.primary }}>
          <Appbar.Action icon="arrow-left" onPress={() => (onBack ? onBack() : router.back())} color="#fff" />
          <Appbar.Content title="EVzone Aggregator & CPMS" titleStyle={{ fontWeight:'800', color:'#fff' }} subtitle="manage unlimited commercial stations" color="#fff" />
          <Appbar.Action icon="bell-outline" onPress={onBell} color="#fff" />
        </Appbar.Header>
        <ScrollView contentContainerStyle={[styles.content,{ paddingTop:16 }] }>
          <GlassCard>
            <Text variant="labelLarge" style={{ fontWeight:'800' }}>Why Aggregator & CPMS?</Text>
            <Text variant="labelSmall" style={{ opacity:0.7, marginTop:4 }}>Operate multiple commercial chargers at scale: routing, tenant billing, RFID, bulk diagnostics, smart tariffs and enterprise exports.</Text>
            <View style={{ flexDirection:'row', flexWrap:'wrap', gap:6, marginTop:8 }}>
              <Chip icon="check-decagram" compact>Certified billing & receipts</Chip>
              <Chip icon="office-building" compact>Multi‑site operations</Chip>
            </View>
            <View style={{ flexDirection:'row', gap:8, marginTop:8 }}>
              <Button mode="contained" buttonColor={theme.colors.secondary} textColor="#fff" icon="open-in-new" onPress={onOpenAggregator}>Open Aggregator</Button>
              <Button mode="outlined" onPress={onReadDocs}>Read docs</Button>
            </View>
            <Text variant="labelSmall" style={{ opacity:0.7, marginTop:8 }}>Note: In EVzone Private Charging, you can monetize exactly one Commercial Charger. Use Aggregator & CPMS for more.</Text>
          </GlassCard>
        </ScrollView>
        {/* Bottom tabs are handled by the app's (tabs) layout. Avoid rendering a second BottomNavigation here. */}
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  root:{ flex:1, backgroundColor: theme.colors.background },
  content:{ padding:16 },
  blurCard:{ borderRadius:14, overflow:'hidden', borderWidth:1, borderColor:'#ffffff' },
  blurInner:{ padding:12, backgroundColor: Platform.select({ ios:'#ffffff', android:'#ffffff' }) },
});
