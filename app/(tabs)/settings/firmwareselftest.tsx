import { useEffect, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, Platform, Modal } from 'react-native';
import { router } from 'expo-router';
import {
  Provider as PaperProvider,
  MD3LightTheme as DefaultTheme,
  Appbar,
  Text,
  Button,
  Chip,
  ProgressBar,
  Icon,
} from 'react-native-paper';
import { BlurView } from 'expo-blur';

// ---- Theme ----
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#03cd8c',
    secondary: '#f77f00',
    background: '#f2f2f2',
    surface: 'rgba(255,255,255,0.7)'
  },
  roundness: 14,
  fonts: DefaultTheme.fonts,
};

export type FirmwareSelfTestProps = {
  onBack?: () => void;
  onHelp?: () => void;
  onNavChange?: (value: number) => void;
  onCheckUpdate?: (meta: { version: string; notes: string }) => void;
  onStartUpdate?: () => void;
  onRunTests?: () => void;
  onReboot?: () => void;
};

function MobileShell({ title, tagline, onBack, onHelp, navValue, onNavChange, footer, children }:{
  title: string; tagline?: string; onBack?: () => void; onHelp?: () => void; navValue: number; onNavChange?: (v:number)=>void; footer?: React.ReactNode; children: React.ReactNode;
}){
  return (
    <View style={styles.root}>
      <Appbar.Header mode="small" elevated>
          <Appbar.Action icon="arrow-left" onPress={() => (onBack ? onBack() : router.back())} />
        <Appbar.Content title={title} titleStyle={{ fontWeight: '700' }} subtitle={tagline} />
        <Appbar.Action icon="help-circle-outline" onPress={onHelp} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
      <View style={styles.footerWrap}>{footer}</View>
    </View>
  );
}

function GlassCard({ children, style }:{ children: React.ReactNode; style?: any }){
  return (
    <BlurView intensity={Platform.OS === 'ios' ? 35 : 50} tint="light" style={[styles.blurCard, style]}>
      <View style={styles.blurInner}>{children}</View>
    </BlurView>
  );
}

export default function FirmwareSelfTest({ onBack, onHelp, onNavChange, onCheckUpdate, onStartUpdate, onRunTests, onReboot }: FirmwareSelfTestProps){
  const [navValue, setNavValue] = useState(1);
  const [checking, setChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confirmReboot, setConfirmReboot] = useState(false);

  const checkForUpdate = async () => {
    setChecking(true);
    setTimeout(()=>{ setChecking(false); setUpdateAvailable(true); onCheckUpdate?.({ version: 'v1.2.4', notes: 'Stability improvements' }); }, 800);
  };

  const startUpdate = async () => {
    setInstalling(true); setProgress(0);
    const timer = setInterval(()=> setProgress(p => { const n = Math.min(p + 0.1, 1); if (n >= 1){ clearInterval(timer); setInstalling(false); setUpdateAvailable(false); } return n; }), 500);
    onStartUpdate?.();
  };

  const runSelfTests = () => onRunTests?.();
  const reboot = () => { setConfirmReboot(false); onReboot?.(); };

  return (
    <PaperProvider theme={theme}>
      <MobileShell title="Firmware & self‑test" tagline="OTA updates • diagnostics • reboot" onBack={onBack} onHelp={onHelp}
        navValue={navValue} onNavChange={(v)=>{ setNavValue(v); onNavChange?.(v); }} footer={null}>
        <View style={styles.section}>
          {/* Firmware card */}
          <GlassCard>
            <Text variant="labelLarge" style={{ fontWeight: '800' }}>Firmware</Text>
            <View style={{ height: 6 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip style={{ marginRight: 6, marginBottom: 6 }}>Current: v1.2.3</Chip>
              {updateAvailable ? <Chip style={{ marginRight: 6, marginBottom: 6 }}>Update available: v1.2.4</Chip> : <Chip style={{ marginRight: 6, marginBottom: 6 }}>Up to date</Chip>}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Button mode="outlined" onPress={checkForUpdate}>Check for updates</Button>
              <Button mode="contained" disabled={!updateAvailable || installing} onPress={startUpdate} style={{ marginLeft: 8 }} buttonColor={theme.colors.secondary} textColor="#fff">Start OTA</Button>
            </View>
            {checking ? <Text variant="labelSmall" style={{ opacity: 0.7, marginTop: 6 }}>Checking for updates…</Text> : null}
            {installing && (
              <View style={{ marginTop: 8 }}>
                <ProgressBar progress={progress} />
                <Text variant="labelSmall" style={{ opacity: 0.7 }}>Installing… {Math.round(progress*100)}%</Text>
              </View>
            )}
          </GlassCard>

          {/* Changelog */}
          <GlassCard style={{ marginTop: 12 }}>
            <Text variant="labelLarge" style={{ fontWeight: '800', marginBottom: 6 }}>Changelog</Text>
            <Text variant="bodySmall">• v1.2.4 — Stability improvements, added connector test diagnostics.</Text>
            <Text variant="bodySmall">• v1.2.3 — Better OCPP timeouts, UI bug fixes.</Text>
          </GlassCard>

          {/* Self‑tests & reboot */}
          <GlassCard style={{ marginTop: 12 }}>
            <Text variant="labelLarge" style={{ fontWeight: '800', marginBottom: 6 }}>Self‑tests</Text>
            <View style={{ flexDirection: 'row' }}>
              <Button mode="outlined" onPress={runSelfTests}>Run tests</Button>
              <Button mode="outlined" textColor="#d32f2f" onPress={()=>setConfirmReboot(true)} style={{ marginLeft: 8 }}>Reboot charger</Button>
            </View>
          </GlassCard>
        </View>
      </MobileShell>

      {/* Reboot confirm */}
      <Modal visible={confirmReboot} onRequestClose={()=>setConfirmReboot(false)}>
        <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.25)' }}>
          <GlassCard>
            <Text variant="titleMedium" style={{ fontWeight: '800' }}>Confirm reboot</Text>
            <Text variant="bodySmall" style={{ marginTop: 6 }}>Are you sure you want to reboot the charger? Ongoing sessions will stop.</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
              <Button onPress={()=>setConfirmReboot(false)}>Cancel</Button>
              <Button mode="contained" buttonColor={theme.colors.secondary} textColor="#fff" onPress={reboot} style={{ marginLeft: 8 }}>Reboot</Button>
            </View>
          </GlassCard>
        </View>
      </Modal>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f2f2f2' },
  content: { padding: 16 },
  footerWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  
  section: { paddingBottom: 120 },
  blurCard: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.55)' },
  blurInner: { padding: 12, backgroundColor: Platform.select({ ios: 'rgba(255,255,255,0.2)', android: 'rgba(255,255,255,0.35)' }) },
});
import * as React from 'react';
