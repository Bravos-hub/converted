import { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import {
  Provider as PaperProvider,
  MD3LightTheme as DefaultTheme,
  Appbar,
  Text,
  Button,
  Chip,
  IconButton,
  
  TextInput,
  Checkbox,
  HelperText,
  Menu,
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

// ---- Types ----
export type Station = { id: string; name: string; location?: string };
export type Connector = { id: string; label: string; status: 'Available' | 'In use' | string };

export type StartByQRorIDProps = {
  onBack?: () => void;
  onHelp?: () => void;
  onNavChange?: (value: number) => void;
  onResolve?: (station: Station) => void;
  onStart?: (payload: { station: Station; connector?: Connector }) => void;
  onOpenActions?: (station: Station) => void;
};

// ---- Shell ----
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

// ---- Glass ----
function GlassCard({ children, style }:{ children: React.ReactNode; style?: any }){
  return (
    <BlurView intensity={Platform.OS === 'ios' ? 35 : 50} tint="light" style={[styles.blurCard, style]}>
      <View style={styles.blurInner}>{children}</View>
    </BlurView>
  );
}

// ---- Main ----
export default function StartByQRorID({ onBack, onHelp, onNavChange, onResolve, onStart, onOpenActions }: StartByQRorIDProps){
  const [navValue, setNavValue] = useState(1);
  const chargers = useMemo(()=> ([
    { id: 'st1', name: 'Home Charger' },
    { id: 'st2', name: 'Office Charger' },
  ]), []);
  const [chargerId, setChargerId] = useState('st1');
  const [menuOpen, setMenuOpen] = useState(false);
  const [manualId, setManualId] = useState('');
  const [safetyOk, setSafetyOk] = useState(false);
  const [resolved, setResolved] = useState<Station | null>(null);

  const connectors: Connector[] = useMemo(()=> ([
    { id: 'c1', label: 'Connector 1 — Type 2', status: 'Available' },
    { id: 'c2', label: 'Connector 2 — CCS 2', status: 'Available' },
    { id: 'c3', label: 'Connector 3 — CHAdeMO', status: 'In use' },
  ]), []);

  const resolve = (idOrQr?: string) => {
    const st = chargers.find(x => x.id === chargerId) || chargers[0];
    const station = { id: idOrQr || st.id, name: st.name, location: 'Kampala' };
    setResolved(station);
    onResolve?.(station);
  };

  const proceed = () => {
    if (!resolved) return;
    const chosen = connectors.find(c => c.status === 'Available');
    if (onStart) return onStart({ station: resolved, connector: chosen });
    if (onOpenActions) return onOpenActions(resolved);
  };

  return (
    <PaperProvider theme={theme}>
      <MobileShell title="Start session" tagline="scan QR or enter ID • safety" onBack={onBack} onHelp={onHelp}
        navValue={navValue} onNavChange={(v)=>{setNavValue(v); onNavChange?.(v);}} footer={null}>
        <View style={styles.section}>
          {/* Charger selector */}
          <GlassCard>
            <Text variant="labelLarge" style={{ fontWeight: '800', marginBottom: 8 }}>My chargers</Text>
            <Menu visible={menuOpen} onDismiss={()=>setMenuOpen(false)} anchor={<Button mode="outlined" onPress={()=>setMenuOpen(true)}>{chargers.find(c=>c.id===chargerId)?.name}</Button>}>
              {chargers.map(ch => (
                <Menu.Item key={ch.id} title={ch.name} onPress={()=>{ setChargerId(ch.id); setMenuOpen(false); }} />
              ))}
            </Menu>
          </GlassCard>

          {/* Identify */}
          <GlassCard style={{ marginTop: 12 }}>
            <Text variant="labelLarge" style={{ fontWeight: '800', marginBottom: 8 }}>Identify charger</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Button mode="outlined" icon="qrcode-scan" onPress={()=>resolve('EVZ-QR-000999')}>
                Scan QR
              </Button>
              <TextInput style={{ flex: 1, marginLeft: 8 }} mode="outlined" placeholder="Enter charger ID" value={manualId} onChangeText={setManualId} left={<TextInput.Affix text="ID" />} />
              <Button mode="contained" buttonColor={theme.colors.secondary} textColor="#fff" style={{ marginLeft: 8 }} onPress={()=>resolve(manualId)}>Resolve</Button>
            </View>

            {resolved && (
              <View style={{ marginTop: 8 }}>
                <Text variant="bodySmall"><Text style={{ fontWeight: '700' }}>Station:</Text> {resolved.name} • {resolved.id}</Text>
                <Text variant="labelSmall" style={{ opacity: 0.7 }}>{resolved.location}</Text>
                <View style={{ height: 8 }} />
                <Text variant="labelLarge" style={{ fontWeight: '800', marginBottom: 6 }}>Choose connector</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {connectors.map(c => (
                    <Chip key={c.id} disabled={c.status !== 'Available'} style={{ marginRight: 6, marginBottom: 6 }}>
                      {`${c.label} • ${c.status}`}
                    </Chip>
                  ))}
                </View>
              </View>
            )}
          </GlassCard>

          {/* Safety */}
          <GlassCard style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Checkbox status={safetyOk ? 'checked' : 'unchecked'} onPress={()=>setSafetyOk(!safetyOk)} />
              <Text variant="bodyMedium">I confirm the cable and area are safe to charge.</Text>
            </View>
            <HelperText type={safetyOk ? 'info' : 'error'}>{safetyOk ? 'Ready' : 'Please confirm safety before starting.'}</HelperText>
            <Button mode="contained" disabled={!resolved || !safetyOk} icon="ev-plug-ccs2" onPress={proceed}
              buttonColor={theme.colors.secondary} textColor="#fff">Start charging</Button>
          </GlassCard>
        </View>
      </MobileShell>
    </PaperProvider>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f2f2f2' },
  content: { padding: 16 },
  footerWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  
  section: { paddingBottom: 120 },
  blurCard: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.55)' },
  blurInner: { padding: 12, backgroundColor: Platform.select({ ios: 'rgba(255,255,255,0.2)', android: 'rgba(255,255,255,0.35)' }) },
});
