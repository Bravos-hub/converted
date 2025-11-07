
import { router } from 'expo-router';
import * as React from 'react';
import { useMemo, useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';
import {
    Appbar,
    Button,
    Chip,
    MD3LightTheme as DefaultTheme,
    IconButton,
    List,
    Provider as PaperProvider,
    Text,
    TextInput,
} from 'react-native-paper';
import { useColorTheme } from '../../../hooks/use-color-theme';

// ---- Theme ----
// Now derived at runtime per color scheme using useColorTheme()

// ---- Types ----
export type Pass = {
  id: string;
  label: string;
  code: string;
  expires: string;
  scope: string;
  method: string[]; // ['App','QR','RFID']
  status: 'Active' | 'Revoked' | string;
};

export type GuestPassAccessProps = {
  onBack?: () => void;
  onHelp?: () => void;
  onNavChange?: (value: number) => void;
  onCreate?: (payload: { chargerId: string; label: string; expires: string; scope: string; method: string[] }) => void;
  onRevoke?: (pass: Pass) => void;
  onCopy?: (pass: Pass) => void;
  onShowQR?: (pass: Pass) => void;
};

// ---- Shell ----
function MobileShell({ title, tagline, onBack, onHelp, navValue, onNavChange, footer, children, containerStyle }:{
  title: string; tagline?: string; onBack?: () => void; onHelp?: () => void; navValue: number; onNavChange?: (v:number)=>void; footer?: React.ReactNode; children: React.ReactNode; containerStyle?: any;
}){
  return (
    <View style={[styles.root, containerStyle]}>
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
    <View style={[styles.blurCard, style]}>
      <View style={styles.blurInner}>{children}</View>
    </View>
  );
}

function PassRow({ p, onRevoke, onShowQR, onCopy }:{ p: Pass; onRevoke?: (p:Pass)=>void; onShowQR?: (p:Pass)=>void; onCopy?: (p:Pass)=>void; }){
  const C = useColorTheme();
  return (
    <GlassCard>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text variant="titleSmall" style={{ fontWeight: '700' }}>{p.label}</Text>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>{p.code} • {p.expires}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
            <Chip compact style={{ marginRight: 6, marginBottom: 6 }}>{p.scope}</Chip>
            <Chip compact style={{ marginRight: 6, marginBottom: 6 }}>{p.method.join(', ')}</Chip>
            <Chip compact style={{ marginRight: 6, marginBottom: 6 }} icon={p.status === 'Active' ? 'check-decagram' : undefined}>
              {p.status}
            </Chip>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton icon="qrcode" onPress={()=>onShowQR?.(p)} />
          <IconButton icon="link" onPress={()=>onCopy?.(p)} />
          <IconButton icon="delete-outline" iconColor={C.error} onPress={()=>onRevoke?.(p)} />
        </View>
      </View>
    </GlassCard>
  );
}

export default function GuestPassAccessCodes({ onBack, onHelp, onNavChange, onCreate, onRevoke, onCopy, onShowQR }: GuestPassAccessProps){
  const C = useColorTheme();
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: C.primary,
      secondary: C.secondary,
      background: C.surface,
      surface: '#ffffff'
    },
    roundness: 14,
    fonts: DefaultTheme.fonts,
  } as const;
  const [navValue, setNavValue] = useState(1);
  const chargers = useMemo(()=> ([{ id: 'st1', name: 'Home Charger' }, { id: 'st2', name: 'Office Charger' }]), []);
  const [chargerId, setChargerId] = useState('st1');
  const [label, setLabel] = useState('Visitor pass');
  const [expires, setExpires] = useState('');
  const [scope, setScope] = useState('Station');
  const [method, setMethod] = useState<string[]>(['App','QR']);
  const [qrOpen, setQrOpen] = useState(false);
  const [activeQR, setActiveQR] = useState<Pass | null>(null);

  const passes = useMemo<Record<string, Pass[]>>(()=> ({
    st1: [ { id: 'gp1', label: 'Contractor (AM)', code: 'EVZ-GP-7F3A', expires: '2025-10-31 12:00', scope: 'Station', method: ['App','QR'], status: 'Active' } ],
    st2: [ { id: 'gp2', label: 'Guest (Weekend)', code: 'EVZ-GP-1B9D', expires: '2025-10-20 20:00', scope: 'Connector 2', method: ['QR'], status: 'Revoked' } ]
  }), []);

  const Footer = (
    <View style={[styles.footerActions, { backgroundColor: C.surface, borderTopColor: C.border }]}>
      <Button mode="contained" buttonColor={theme.colors.secondary} textColor="#fff" onPress={()=> onCreate?.({ chargerId, label, expires, scope, method })}>Create pass</Button>
    </View>
  );

  const showQR = (p: Pass) => { setActiveQR(p); setQrOpen(true); onShowQR?.(p); };

  return (
    <PaperProvider theme={theme}>
      <MobileShell title="Guest pass & access codes" tagline="time‑bound passes • QR/link" onBack={onBack} onHelp={onHelp}
        navValue={navValue} onNavChange={(v)=>{ setNavValue(v); onNavChange?.(v); }} footer={Footer} containerStyle={{ backgroundColor: C.surface }}>
        <View style={styles.section}>
          {/* Charger selector */}
          <GlassCard>
            <Text variant="labelLarge" style={{ fontWeight: '800', marginBottom: 8 }}>My chargers</Text>
            <TextInput mode="outlined" value={chargers.find(c=>c.id===chargerId)?.name}
              right={<TextInput.Icon icon="menu-down" />} onFocus={()=>{ /* noop */ }} />
          </GlassCard>

          {/* Create */}
          <GlassCard style={{ marginTop: 12 }}>
            <Text variant="labelLarge" style={{ fontWeight: '800', marginBottom: 8 }}>Create time‑bound pass</Text>
            <View style={{ gap: 10 }}>
              <TextInput label="Label" value={label} onChangeText={setLabel} mode="outlined" />
              <TextInput label="Expires" value={expires} onChangeText={setExpires} mode="outlined" placeholder="YYYY-MM-DD hh:mm" />
              <TextInput label="Scope (e.g., Station / Connector 2)" value={scope} onChangeText={setScope} mode="outlined" />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {['App','QR','RFID'].map(m => (
                  <Chip key={m} style={{ marginRight: 6, marginBottom: 6 }} selected={method.includes(m)} onPress={()=> setMethod(prev => prev.includes(m) ? prev.filter(x=>x!==m) : [...prev, m]) }>
                    {m}
                  </Chip>
                ))}
              </View>
            </View>
          </GlassCard>

          {/* Existing passes */}
          <View style={{ marginTop: 12 }}>
            <Text variant="labelLarge" style={{ fontWeight: '800', marginBottom: 8 }}>Existing passes</Text>
            <View style={{ gap: 10 }}>
              {(passes[chargerId] || []).map(p => (
                <PassRow key={p.id} p={p} onRevoke={onRevoke} onShowQR={showQR} onCopy={onCopy} />
              ))}
            </View>
          </View>

          {/* Usage logs */}
          <GlassCard style={{ marginTop: 12, marginBottom: 16 }}>
            <Text variant="labelLarge" style={{ fontWeight: '800', marginBottom: 8 }}>Usage logs</Text>
            <List.Section>
              <List.Item title="2025-10-18 10:21 — EVZ-GP-7F3A — Connector 2 — Success" />
              <List.Item title="2025-10-15 18:10 — EVZ-GP-1B9D — Station — Revoked" />
            </List.Section>
          </GlassCard>
        </View>
      </MobileShell>

      {/* QR modal */}
      <Modal visible={qrOpen} onRequestClose={()=>setQrOpen(false)}>
        <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: C.glassCardBg }}>
          <GlassCard>
            <Text variant="titleMedium" style={{ fontWeight: '800' }}>Pass QR — {activeQR?.label}</Text>
            <View style={{ height: 12 }} />
            <IconButton icon="qrcode" size={84} disabled />
            <Text variant="labelSmall" style={{ opacity: 0.7, textAlign: 'center' }}>
              Share this code or tap copy link to send a deep link.
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
              <Button icon="content-copy" onPress={()=> setQrOpen(false)}>Copy link</Button>
              <Button icon="eye" onPress={()=> setQrOpen(false)}>Preview</Button>
            </View>
            <Button mode="contained" onPress={()=>setQrOpen(false)} style={{ marginTop: 8 }}>Close</Button>
          </GlassCard>
        </View>
      </Modal>
    </PaperProvider>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16 },
  footerWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  
  section: { paddingBottom: 120 },
  footerActions: { paddingHorizontal: 16, paddingBottom: 12 + Number(Platform.select({ ios: 8, android: 0 })), paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  blurCard: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#ffffff' },
  blurInner: { padding: 12, backgroundColor: Platform.select({ ios: '#ffffff', android: '#ffffff' }) },
});
