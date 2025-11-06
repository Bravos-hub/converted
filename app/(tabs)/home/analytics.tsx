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
  
  TextInput,
} from 'react-native-paper';
import { BlurView } from 'expo-blur';
import Svg, { Line, Path, Rect, Text as SvgText } from 'react-native-svg';

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

export type EnergyAnalyticsProps = {
  chargers?: { id: string; name: string }[];
  connectorsMap?: Record<string, { id: string; name: string }[]>;
  defaultChargerId?: string;
  currency?: string;
  onExportAnalytics?: (payload: any) => void;
  onHelp?: () => void;
  onBack?: () => void;
  onNavChange?: (v:number)=>void;
};

function MobileShell({ title, tagline, onBack, onHelp, navValue, onNavChange, children }:{
  title: string; tagline?: string; onBack?: () => void; onHelp?: () => void; navValue: number; onNavChange?: (v:number)=>void; children: React.ReactNode;
}){
  return (
    <View style={styles.root}>
      <Appbar.Header mode="small" elevated>
        <Appbar.Action icon="arrow-left" onPress={() => (onBack ? onBack() : router.back())} />
        <Appbar.Content title={title} titleStyle={{ fontWeight: '700' }} subtitle={tagline} />
        <Appbar.Action icon="bell-outline" onPress={onHelp} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
      {/* Tabs are provided by the main layout */}
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

function Metric({ icon, label, value }:{ icon?: React.ReactNode; label: string; value: string|number }){
  return (
    <GlassCard>
      <View style={{ alignItems: 'center' }}>
        <Text variant="labelSmall" style={{ opacity: 0.7 }}>{label}</Text>
        <Text variant="titleMedium" style={{ fontWeight: '800' }}>{value}</Text>
      </View>
    </GlassCard>
  );
}

function AreaChartMini({ data, xKey, yKey }:{ data: any[]; xKey: string; yKey: string }){
  const W=360, H=160, P=24;
  if (!data || data.length===0) return <View style={{ height: 80, alignItems:'center', justifyContent:'center' }}><Text>No data</Text></View>;
  const ys = data.map(d=>d[yKey]); const yMax = Math.max(1, ...ys);
  const xStep = (W - 2*P) / Math.max(1, data.length - 1);
  const X = (i:number) => P + i*xStep; const Y = (v:number) => H-P - (v/yMax)*(H-2*P);
  const path = data.map((d,i)=> `${i===0?'M':'L'} ${X(i)} ${Y(d[yKey])}`).join(' ');
  const area = `${path} L ${X(data.length-1)} ${H-P} L ${X(0)} ${H-P} Z`;
  return (
    <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height={180}>
      {[0,1,2,3,4].map(i=> (
        <Line key={i} x1={P} x2={W-P} y1={P+i*(H-2*P)/4} y2={P+i*(H-2*P)/4} stroke="#eef3f1" strokeWidth={1} />
      ))}
      <Path d={area} fill="rgba(3,205,140,0.28)" />
      <Path d={path} fill="none" stroke="#03cd8c" strokeWidth={2} />
      {data.map((d,i)=> (
        <SvgText key={i} x={X(i)} y={H-6} fontSize={10} textAnchor="middle" fill="#98a1a0">{d[xKey]}</SvgText>
      ))}
    </Svg>
  );
}

function DualBarChartMini({ data, xKey, leftKey, rightKey }:{ data:any[]; xKey:string; leftKey:string; rightKey:string }){
  const W=360, H=200, P=28, G=6;
  if (!data || data.length===0) return <View style={{ height: 80, alignItems:'center', justifyContent:'center' }}><Text>No data</Text></View>;
  const yMax = Math.max(1, ...data.map(d=> Math.max(d[leftKey], d[rightKey])));
  const band = (W - 2*P)/data.length; const barW = (band - G)/2;
  const XL = (i:number) => P + i*band; const XR = (i:number) => P + i*band + barW + G; const Y = (v:number) => H-P - (v/yMax)*(H-2*P);
  return (
    <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height={220}>
      {[0,1,2,3,4].map(i=> (
        <Line key={i} x1={P} x2={W-P} y1={P+i*(H-2*P)/4} y2={P+i*(H-2*P)/4} stroke="#eef3f1" strokeWidth={1} />
      ))}
      {data.map((d,i)=> (
        <>
          <Rect key={`l-${i}`} x={XL(i)} y={Y(d[leftKey])} width={barW} height={H-P - Y(d[leftKey])} fill="#f77f00" />
          <Rect key={`r-${i}`} x={XR(i)} y={Y(d[rightKey])} width={barW} height={H-P - Y(d[rightKey])} fill="#03cd8c" />
          <SvgText key={`t-${i}`} x={P+i*band+band/2} y={H-6} fontSize={10} textAnchor="middle" fill="#98a1a0">{d[xKey]}</SvgText>
        </>
      ))}
    </Svg>
  );
}

export default function EnergyAnalytics({
  chargers = [{ id:'st1', name:'Home Charger' }, { id:'st2', name:'Office Charger' }],
  connectorsMap = { st1:[{id:'all',name:'All connectors'},{id:'c1',name:'Connector 1'},{id:'c2',name:'Connector 2'}], st2:[{id:'all',name:'All connectors'},{id:'c3',name:'Connector 3'}] },
  defaultChargerId = 'st1',
  currency = 'UGX',
  onExportAnalytics,
  onHelp, onBack, onNavChange
}: EnergyAnalyticsProps){
  const [navValue, setNavValue] = useState(2);
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [connectorId, setConnectorId] = useState('all');
  const [range, setRange] = useState<'7d'|'30d'|'90d'|'custom'>('7d');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const series = useMemo(()=>{
    const days = range==='7d'?7:(range==='30d'?30:(range==='90d'?90:14));
    const labels = ['01','02','03','04','05','06','07','08','09','10','11','12'];
    const out: any[] = [];
    for (let i=0;i<days;i++){
      const kWh = Math.round((Math.sin(i/3)+1.3)*6 + (chargerId==='st2'?2:0) + (connectorId!=='all'?1:0));
      const sessions = Math.max(1, Math.round(kWh/6));
      const cost = kWh*1200;
      const label = labels[i%labels.length];
      out.push({ label, kWh, sessions, cost });
    }
    return out;
  }, [range, chargerId, connectorId]);

  const totals = useMemo(()=>{
    const kWh = series.reduce((s,x)=> s + x.kWh, 0);
    const sessions = series.reduce((s,x)=> s + x.sessions, 0);
    const cost = series.reduce((s,x)=> s + x.cost, 0);
    return { kWh, sessions, cost };
  }, [series]);

  const connectorList = connectorsMap[chargerId] || [{ id:'all', name:'All connectors' }];

  const exportClick = () => onExportAnalytics?.({ chargerId, connectorId, range, from, to, series });

  return (
    <PaperProvider theme={theme}>
      <MobileShell title="Energy analytics" tagline="kWh • cost • sessions" onBack={onBack} onHelp={onHelp}
        navValue={navValue} onNavChange={(v)=>{ setNavValue(v); onNavChange?.(v); }}>
        <GlassCard>
          <Text variant="labelSmall">Charts are lightweight SVG for reliable bundling in sandboxed environments.</Text>
        </GlassCard>

        {/* Filters */}
        <GlassCard style={{ marginTop: 12 }}>
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput value={chargers.find(c=>c.id===chargerId)?.name} mode="outlined" label="Charger" style={{ flex: 1, marginRight: 8 }} onChangeText={()=>{}} />
              <TextInput value={connectorList.find(c=>c.id===connectorId)?.name} mode="outlined" label="Connector" style={{ flex: 1 }} onChangeText={()=>{}} />
              <Button mode="contained" icon="download" style={{ marginLeft: 8 }} onPress={exportClick} buttonColor={theme.colors.secondary} textColor="#fff">Export</Button>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
              {(['7d','30d','90d'] as const).map(k => (
                <Chip key={k} selected={range===k} onPress={()=>setRange(k)} style={{ marginRight: 6, marginBottom: 6 }}>{k.toUpperCase()}</Chip>
              ))}
              <Chip selected={range==='custom'} onPress={()=>setRange('custom')} style={{ marginRight: 6, marginBottom: 6 }}>CUSTOM</Chip>
              {range==='custom' && (
                <>
                  <TextInput mode="outlined" label="From" value={from} onChangeText={setFrom} style={{ width: 140, marginRight: 8 }} />
                  <TextInput mode="outlined" label="To" value={to} onChangeText={setTo} style={{ width: 140 }} />
                </>
              )}
            </View>
          </View>
        </GlassCard>

        {/* Totals */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <Metric label="kWh" value={totals.kWh} />
          <Metric label={`Cost (${currency})`} value={totals.cost.toLocaleString()} />
          <Metric label="Sessions" value={totals.sessions} />
        </View>

        <GlassCard style={{ marginTop: 12 }}>
          <Text variant="labelLarge" style={{ fontWeight: '800', marginBottom: 6 }}>Energy (kWh)</Text>
          <AreaChartMini data={series} xKey="label" yKey="kWh" />
        </GlassCard>

        <GlassCard style={{ marginTop: 12, marginBottom: 120 }}>
          <Text variant="labelLarge" style={{ fontWeight: '800', marginBottom: 6 }}>Cost & sessions</Text>
          <DualBarChartMini data={series} xKey="label" leftKey="cost" rightKey="sessions" />
        </GlassCard>
      </MobileShell>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f2f2f2' },
  content: { padding: 16 },
  
  blurCard: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.55)' },
  blurInner: { padding: 12, backgroundColor: Platform.select({ ios: 'rgba(255,255,255,0.2)', android: 'rgba(255,255,255,0.35)' }) },
});
