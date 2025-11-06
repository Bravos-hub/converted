import { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import {
  Provider as PaperProvider,
  MD3LightTheme as DefaultTheme,
  Appbar,
  Text,
  Button,
  
  TextInput,
  Chip,
} from 'react-native-paper';
import { BlurView } from 'expo-blur';

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary:'#03cd8c', secondary:'#f77f00', background:'#f2f2f2', surface:'rgba(255,255,255,0.7)' }, roundness:14 };

type Period = { name:string; start:string; end:string; days:string[]; rate:number };
export type UtilityTOUImportProps = {
  chargers?: { id:string; name:string }[];
  defaultChargerId?: string;
  commercialChargerId?: string;
  selectedChargerId?: string;
  aggregatorUrl?: string;
  onOpenAggregator?: (url?:string)=>void;
  onBack?: ()=>void; onHelp?: ()=>void; onNavChange?: (v:number)=>void;
  onApplyTOU?: (p:{ chargerId:string; periods:Period[] })=>void; onFetchFromAPI?: (p:{ chargerId:string; url:string })=>void; onNavigatePricing?: (p:{ chargerId:string; periods:Period[] })=>void;
};

function GlassCard({ children, style }:{ children: React.ReactNode; style?: any }){
  return (
    <BlurView intensity={Platform.OS==='ios'?35:50} tint="light" style={[styles.blurCard, style]}>
      <View style={styles.blurInner}>{children}</View>
    </BlurView>
  );
}

function PeriodRow({ p }:{ p:Period }){
  return (
    <GlassCard>
      <Text variant="titleSmall" style={{ fontWeight:'700' }}>{p.name}</Text>
      <Text variant="labelSmall" style={{ opacity:0.7 }}>{p.start} → {p.end} • {p.days.join(', ')}</Text>
      <Chip compact style={{ marginTop:4 }}>{`UGX ${p.rate}/kWh`}</Chip>
    </GlassCard>
  );
}

function parseCSV(text:string): Period[]{
  const rows = text.split(/\r?\n/).filter(Boolean);
  if (!rows.length) return [];
  const header = rows[0].split(',').map(s=>s.trim());
  const idx = (k:string) => header.indexOf(k);
  const col = { name: idx('name'), start: idx('start'), end: idx('end'), days: idx('days'), rate: idx('rate') } as const;
  return rows.slice(1).map(line => {
    const c = line.split(',');
    return { name: (c[col.name]||'').trim(), start:(c[col.start]||'').trim(), end:(c[col.end]||'').trim(), days:(c[col.days]||'').trim().split('|'), rate: Number((c[col.rate]||'0').trim())||0 };
  });
}

export default function UtilityTOUImport({
  chargers=[{id:'st1',name:'Home Charger'},{id:'st2',name:'Office Charger'}], defaultChargerId='st1', commercialChargerId, selectedChargerId, aggregatorUrl, onOpenAggregator,
  onBack, onHelp, onNavChange, onApplyTOU, onFetchFromAPI, onNavigatePricing
}: UtilityTOUImportProps){
  const [navValue, setNavValue] = useState(1);
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [csv, setCsv] = useState('name,start,end,days,rate\nOff‑peak,00:00,05:59,Mon|Tue|Wed|Thu|Fri|Sat|Sun,900\nPeak,18:00,22:59,Mon|Tue|Wed|Thu|Fri,1500');
  const [periods, setPeriods] = useState<Period[]>([]);
  const [apiUrl, setApiUrl] = useState('');

  const currentId = selectedChargerId || chargerId;
  const isCommercial = !!(currentId && commercialChargerId && currentId===commercialChargerId);

  const parse = () => { try{ setPeriods(parseCSV(csv)); } catch(e){} };
  const apply = () => { onApplyTOU?.({ chargerId: currentId, periods }); onNavigatePricing?.({ chargerId: currentId, periods }); };

  const Footer = (
    <View style={styles.footer}>
      <Button mode="outlined" icon="download" onPress={()=> onFetchFromAPI ? onFetchFromAPI({ chargerId: currentId, url: apiUrl }) : null}>Fetch from API</Button>
      <Button mode="contained" buttonColor={theme.colors.secondary} textColor="#fff" icon="check" onPress={apply} style={{ marginLeft:'auto' }}>Apply to pricing</Button>
    </View>
  );

  return (
    <PaperProvider theme={theme}>
      <View style={styles.root}>
        <Appbar.Header mode="small" elevated>
          <Appbar.Action icon="arrow-left" onPress={() => (onBack ? onBack() : router.back())} />
          <Appbar.Content title="Utility TOU import" titleStyle={{ fontWeight:'700' }} subtitle="CSV/API • preview • apply" />
          <Appbar.Action icon="help-circle-outline" onPress={onHelp} />
        </Appbar.Header>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Charger selector */}
          <GlassCard>
            <Text variant="labelLarge" style={{ fontWeight:'800', marginBottom: 6 }}>My chargers</Text>
            <TextInput mode="outlined" value={chargers.find(c=>c.id===chargerId)?.name} right={<TextInput.Icon icon="menu-down" />} onFocus={()=>{}} />
          </GlassCard>

          {/* Commercial badge + Aggregator CTA */}
          <View style={{ flexDirection:'row', alignItems:'center', marginTop:8 }}>
            <Chip>{isCommercial? 'Commercial Charger' : 'Not commercial'}</Chip>
            {!isCommercial && (
              <Button mode="text" onPress={()=> onOpenAggregator?.(aggregatorUrl)} style={{ marginLeft:8 }}>Aggregator & CPMS</Button>
            )}
          </View>

          {/* CSV area */}
          <GlassCard style={{ marginTop: 12 }}>
            <Text variant="labelLarge" style={{ fontWeight:'800', marginBottom: 6 }}>Paste CSV</Text>
            <Text variant="labelSmall" style={{ opacity:0.7 }}>Columns: name,start,end,days,rate • Use Mon|Tue|...|Sun</Text>
            <View style={{ height:6 }} />
            <TextInput mode="outlined" multiline value={csv} onChangeText={setCsv} style={{ minHeight: 120 }} />
            <View style={{ flexDirection:'row', marginTop:8 }}>
              <Button mode="outlined" onPress={parse}>Parse</Button>
            </View>
          </GlassCard>

          {/* API URL */}
          <GlassCard style={{ marginTop: 12 }}>
            <Text variant="labelLarge" style={{ fontWeight:'800', marginBottom: 6 }}>Fetch from API (optional)</Text>
            <TextInput placeholder="https://utility.example/api/tou" value={apiUrl} onChangeText={setApiUrl} mode="outlined" />
            <Text variant="labelSmall" style={{ opacity:0.7, marginTop:4 }}>This will call your handler to fetch and map utility data.</Text>
          </GlassCard>

          {/* Preview */}
          <GlassCard style={{ marginTop: 12, marginBottom: 120 }}>
            <Text variant="labelLarge" style={{ fontWeight:'800', marginBottom: 6 }}>Preview</Text>
            <View style={{ gap: 8 }}>
              {periods.map((p,i)=> <PeriodRow key={i} p={p} />)}
              {!periods.length && <Text variant="labelSmall" style={{ opacity:0.7 }}>No periods yet. Paste CSV and press Parse.</Text>}
            </View>
          </GlassCard>
        </ScrollView>
        {/* Tabs handled globally; remove duplicate BottomNavigation */}
        {Footer}
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  root:{ flex:1, backgroundColor:'#f2f2f2' },
  content:{ padding:16 },
  
  blurCard:{ borderRadius:14, overflow:'hidden', borderWidth:1, borderColor:'rgba(255,255,255,0.55)' },
  blurInner:{ padding:12, backgroundColor: Platform.select({ ios:'rgba(255,255,255,0.2)', android:'rgba(255,255,255,0.35)' }) },
  badge:{ height:26, borderRadius:16 },
  footer:{ flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingBottom:12 + Number(Platform.select({ ios: 8, android: 0 })), paddingTop:12, backgroundColor:'#f2f2f2', borderTopWidth:StyleSheet.hairlineWidth, borderTopColor:'#e9eceb' },
});
