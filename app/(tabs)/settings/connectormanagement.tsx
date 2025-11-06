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
  Switch,
  HelperText,
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
export type ConnectorModel = { id: string; name: string; status: 'Available' | 'Charging' | 'Disabled' | string; enabled: boolean; maxPower: string; pricing: string; maxCurrent: number };
export type ConnectorManagementProps = {
  chargers?: { id: string; name: string }[];
  defaultChargerId?: string;
  commercialChargerId?: string;
  selectedChargerId?: string;
  aggregatorUrl?: string;
  onOpenAggregator?: (url?: string) => void;
  onBack?: () => void;
  onHelp?: () => void;
  onNavChange?: (value: number) => void;
  onSave?: (connectors: ConnectorModel[]) => void;
  onToggle?: (c: ConnectorModel) => void;
  onTest?: (c: ConnectorModel) => void;
  onOpenPricingGlobal?: () => void;
  onOpenAvailability?: () => void;
  onOpenPricingConnector?: (c: ConnectorModel) => void;
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

function CommercialBadge({ isCommercial }:{ isCommercial?: boolean }){
  return (
    <Chip compact style={[styles.badge, isCommercial ? styles.badgeCommercial : styles.badgeDefault]} selectedColor="#fff">
      {isCommercial ? 'Commercial Charger' : 'Not commercial'}
    </Chip>
  );
}

function ConnectorRow({ c, onToggle, onTest, onOpenPricingConnector }:{ c: ConnectorModel; onToggle?: (c:ConnectorModel)=>void; onTest?: (c:ConnectorModel)=>void; onOpenPricingConnector?: (c:ConnectorModel)=>void; }){
  const statusColor = c.status === 'Disabled' ? undefined : c.status === 'Charging' ? 'warning' : 'primary';
  return (
    <GlassCard>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text variant="titleSmall" style={{ fontWeight: '700' }}>{c.name}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
            <Chip compact icon="lightning-bolt" style={{ marginRight: 6, marginBottom: 6 }}>{c.maxPower}</Chip>
            <Chip compact onPress={()=>onOpenPricingConnector?.(c)} style={{ marginRight: 6, marginBottom: 6 }}>
              {c.pricing}
            </Chip>
            <Chip compact style={{ marginRight: 6, marginBottom: 6 }}>{c.status}</Chip>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ marginRight: 6 }}>{c.enabled ? 'On' : 'Off'}</Text>
          <Switch value={c.enabled} onValueChange={()=>onToggle?.(c)} />
          <IconButton icon="play" onPress={()=>onTest?.(c)} accessibilityLabel="Test" />
        </View>
      </View>
    </GlassCard>
  );
}

export default function ConnectorManagement({
  chargers = [{ id: 'st1', name: 'Home Charger' }, { id: 'st2', name: 'Office Charger' }],
  defaultChargerId = 'st1',
  commercialChargerId,
  selectedChargerId,
  aggregatorUrl,
  onOpenAggregator,
  onBack, onHelp, onNavChange, onSave, onToggle, onTest, onOpenPricingGlobal, onOpenAvailability, onOpenPricingConnector
}: ConnectorManagementProps){
  const [navValue, setNavValue] = useState(1);
  const [unit, setUnit] = useState('UGX/kWh');
  const [applyAllPrice, setApplyAllPrice] = useState('1200');
  const [applyAllCurrent, setApplyAllCurrent] = useState('32');
  const [priceError, setPriceError] = useState('');

  const [connectors, setConnectors] = useState<ConnectorModel[]>([
    { id: 'c1', name: 'Connector 1 — Type 2', status: 'Available', enabled: true, maxPower: '22 kW', pricing: 'UGX 1200/kWh', maxCurrent: 32 },
    { id: 'c2', name: 'Connector 2 — CCS 2', status: 'Charging', enabled: true, maxPower: '90 kW', pricing: 'UGX 1500/kWh', maxCurrent: 100 },
    { id: 'c3', name: 'Connector 3 — CHAdeMO', status: 'Disabled', enabled: false, maxPower: '50 kW', pricing: 'UGX 1200/kWh', maxCurrent: 60 },
  ]);

  const [chargerId, setChargerId] = useState(defaultChargerId);
  const currentId = selectedChargerId || chargerId;
  const isCommercial = !!(currentId && commercialChargerId && currentId === commercialChargerId);

  const Footer = (
    <View style={styles.footerActions}>
      <Button mode="outlined" onPress={()=>onOpenPricingGlobal?.()}>Global pricing</Button>
      <Button mode="outlined" onPress={()=>onOpenAvailability?.()} style={{ marginLeft: 8 }}>Availability</Button>
      <Button mode="contained" buttonColor={theme.colors.secondary} textColor="#fff" onPress={()=>onSave?.(connectors)} style={{ marginLeft: 'auto' }}>Save all</Button>
    </View>
  );

  const onPriceChange = (v:string) => {
    setApplyAllPrice(v);
    const ok = /^\d+(?:\.\d{1,2})?$/.test(v) && parseFloat(v) > 0;
    setPriceError(ok ? '' : 'Enter a valid amount (e.g., 1200 or 1200.50)');
  };

  const applyToAll = () => {
    if (priceError || !applyAllPrice) return;
    const [currency, suffix] = unit.split('/');
    const priceStr = `${currency.trim()} ${applyAllPrice}/${suffix}`;
    const next = connectors.map(c => ({ ...c, pricing: priceStr, maxCurrent: parseInt(applyAllCurrent || '0', 10) }));
    setConnectors(next);
  };

  const toggleConnector = (c: ConnectorModel) => {
    const next = connectors.map(x => x.id === c.id ? { ...x, enabled: !x.enabled, status: x.enabled ? 'Disabled' : 'Available' } : x);
    setConnectors(next);
    onToggle?.(next.find(x => x.id === c.id)!);
  };

  const testConnector = (c: ConnectorModel) => { onTest?.(c); };

  return (
    <PaperProvider theme={theme}>
      <MobileShell title="Connector management" tagline="status • pricing • current • tests" onBack={onBack} onHelp={onHelp}
        navValue={navValue} onNavChange={(v)=>{ setNavValue(v); onNavChange?.(v); }} footer={Footer}>
        <View style={styles.section}>
          {/* Commercial badge + Aggregator CTA */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <CommercialBadge isCommercial={isCommercial} />
            {!isCommercial && (
              <Button mode="text" onPress={()=>onOpenAggregator?.(aggregatorUrl)} style={{ marginLeft: 8 }}>Aggregator & CPMS</Button>
            )}
          </View>

          {/* Global controls */}
          <GlassCard>
            <Text variant="labelLarge" style={{ fontWeight: '800', marginBottom: 8 }}>Global settings</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
              <TextInput mode="outlined" label="Unit" value={unit} onChangeText={setUnit} style={{ minWidth: 130, marginRight: 8 }} />
              <TextInput mode="outlined" label="Apply price" value={applyAllPrice} onChangeText={onPriceChange} keyboardType="decimal-pad" style={{ width: 160, marginRight: 8 }} />
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ marginRight: 6 }}>Max current (A)</Text>
                <TextInput mode="outlined" value={applyAllCurrent} onChangeText={setApplyAllCurrent} keyboardType="number-pad" style={{ width: 90 }} />
              </View>
              <Button mode="outlined" onPress={applyToAll} disabled={!!priceError || !applyAllPrice} style={{ marginLeft: 8 }}>Apply to all</Button>
            </View>
            {priceError ? <HelperText type="error">{priceError}</HelperText> : null}
          </GlassCard>

          {/* Connectors */}
          <View style={{ marginTop: 12 }}>
            <Text variant="labelLarge" style={{ fontWeight: '800', marginBottom: 8 }}>Connectors</Text>
            <View style={{ gap: 10 }}>
              {connectors.map(c => (
                <ConnectorRow key={c.id} c={c} onToggle={toggleConnector} onTest={testConnector} onOpenPricingConnector={onOpenPricingConnector} />
              ))}
            </View>
          </View>
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
  badge: { height: 26, borderRadius: 16 },
  badgeCommercial: { backgroundColor: '#f77f00' },
  badgeDefault: { backgroundColor: 'rgba(0,0,0,0.08)' },
  footerActions: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12 + Number(Platform.select({ ios: 8, android: 0 })), paddingTop: 12, backgroundColor: '#f2f2f2', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e9eceb' },
  blurCard: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.55)' },
  blurInner: { padding: 12, backgroundColor: Platform.select({ ios: 'rgba(255,255,255,0.2)', android: 'rgba(255,255,255,0.35)' }) },
});
