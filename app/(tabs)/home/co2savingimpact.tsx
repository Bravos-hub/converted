import * as React from 'react';
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
import Svg, { Line, Path, Rect, Text as SvgText } from 'react-native-svg';

// ---- Theme ----
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#03cd8c',
    secondary: '#f77f00',
    background: '#f2f2f2',
    surface: '#ffffff'
  },
  roundness: 14,
  fonts: DefaultTheme.fonts,
};

// ---- Types ----
export type CO2Props = {
  gridFactor?: number; // kg CO2e per kWh grid
  iceFactor?: number;  // kg CO2e per km for ICE
  evFactor?: number;   // kg CO2e per km for EV (well-to-wheel)
  currency?: string;
  pricePerkWh?: number;
  onBack?: () => void;
  onHelp?: () => void;
  onNavChange?: (v:number)=>void;
};

// ---- Utility charts ----
function GlassCard({ children, style }:{ children: React.ReactNode; style?: any }){
  return (
    <View style={[styles.blurCard, style]}>
      <View style={styles.blurInner}>{children}</View>
    </View>
  );
}

function Area({ data }:{ data:{ label:string; kWh:number }[] }){
  const W=360,H=160,P=24;
  if (!data.length) return null;
  const max = Math.max(...data.map(d=>d.kWh), 1);
  const xStep = (W-2*P)/Math.max(1, data.length-1);
  const X = (i:number)=> P + i*xStep; const Y = (v:number)=> H-P - (v/max)*(H-2*P);
  const path = data.map((d,i)=> `${i===0?'M':'L'} ${X(i)} ${Y(d.kWh)}`).join(' ');
  const area = `${path} L ${X(data.length-1)} ${H-P} L ${X(0)} ${H-P} Z`;
  return (
    <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height={180}>
      {[0,1,2,3,4].map(i=> <Line key={i} x1={P} x2={W-P} y1={P+i*(H-2*P)/4} y2={P+i*(H-2*P)/4} stroke="#eef3f1" strokeWidth={1} />)}
      <Path d={area} fill="rgba(3,205,140,0.28)" />
      <Path d={path} fill="none" stroke="#03cd8c" strokeWidth={2} />
      {data.map((d,i)=> <SvgText key={i} x={X(i)} y={H-6} fontSize={10} textAnchor="middle" fill="#98a1a0">{d.label}</SvgText>)}
    </Svg>
  );
}

function Bars({ data }:{ data:{ label:string; ice:number; ev:number }[] }){
  const W=360,H=200,P=28,G=6; if (!data.length) return null;
  const yMax = Math.max(1, ...data.map(d=> Math.max(d.ice, d.ev)));
  const band=(W-2*P)/data.length; const barW=(band-G)/2; const XL=(i:number)=>P+i*band; const XR=(i:number)=>P+i*band+barW+G; const Y=(v:number)=>H-P-(v/yMax)*(H-2*P);
  return (
    <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height={220}>
      {[0,1,2,3,4].map(i=> <Line key={i} x1={P} x2={W-P} y1={P+i*(H-2*P)/4} y2={P+i*(H-2*P)/4} stroke="#eef3f1" strokeWidth={1} />)}
      {data.map((d,i)=> (
        <React.Fragment key={i}>
          <Rect x={XL(i)} y={Y(d.ice)} width={barW} height={H-P-Y(d.ice)} fill="#f77f00" />
          <Rect x={XR(i)} y={Y(d.ev)} width={barW} height={H-P-Y(d.ev)} fill="#03cd8c" />
          <SvgText x={P+i*band+band/2} y={H-6} fontSize={10} textAnchor="middle" fill="#98a1a0">{d.label}</SvgText>
        </React.Fragment>
      ))}
    </Svg>
  );
}

// ---- Screen ----
export default function CO2SavingsImpact({ gridFactor=0.42, iceFactor=0.192, evFactor=0.06, currency='UGX', pricePerkWh=1200, onBack, onHelp, onNavChange }: CO2Props){
  const [navValue, setNavValue] = useState(3);
  const [range, setRange] = useState<'7d'|'30d'|'90d'>('30d');
  const [kwhPerDay, setKwhPerDay] = useState('14');
  const [kmPerDay, setKmPerDay] = useState('38');

  const days = range==='7d'?7:(range==='30d'?30:90);
  const daily = useMemo(()=> Array.from({length:days}).map((_,i)=>({ label: String(i+1).padStart(2,'0'), kWh: Math.max(4, Math.round((Math.sin(i/3)+1.6)*parseFloat(kwhPerDay||'0')))})), [days, kwhPerDay]);

  const totals = useMemo(()=>{
    const kWh = daily.reduce((s,x)=> s + x.kWh, 0);
    const evCO2 = (parseFloat(kmPerDay||'0')*days)*evFactor + kWh*gridFactor; // crude blend
    const iceCO2 = (parseFloat(kmPerDay||'0')*days)*iceFactor;
    const saved = Math.max(iceCO2 - evCO2, 0);
    const cost = kWh*pricePerkWh;
    return { kWh, evCO2, iceCO2, saved, cost };
  }, [daily, kmPerDay, gridFactor, evFactor, iceFactor, pricePerkWh]);

  const compareBars = daily.map(d=> ({ label: d.label, ice: parseFloat(kmPerDay||'0')*iceFactor/daily.length, ev: (parseFloat(kmPerDay||'0')*evFactor + d.kWh*gridFactor/daily.length) }));

  return (
    <PaperProvider theme={theme}>
      <View style={styles.root}>
        <Appbar.Header mode="small" elevated>
          <Appbar.Action icon="arrow-left" onPress={() => (onBack ? onBack() : router.back())} />
          <Appbar.Content title="CO₂ savings & impact" titleStyle={{ fontWeight: '700' }} subtitle="emissions • energy • cost" />
          <Appbar.Action icon="help-circle-outline" onPress={onHelp} />
        </Appbar.Header>
        <ScrollView contentContainerStyle={styles.content}>
          <GlassCard>
            <Text variant="labelSmall">Adjust estimates to see your impact over time.</Text>
          </GlassCard>

          {/* Inputs */}
          <GlassCard style={{ marginTop: 12 }}>
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row' }}>
                <TextInput label="kWh / day" value={kwhPerDay} onChangeText={setKwhPerDay} keyboardType="decimal-pad" mode="outlined" style={{ flex: 1, marginRight: 8 }} />
                <TextInput label="km / day" value={kmPerDay} onChangeText={setKmPerDay} keyboardType="decimal-pad" mode="outlined" style={{ flex: 1 }} />
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {(['7d','30d','90d'] as const).map(k => (
                  <Chip key={k} selected={range===k} onPress={()=>setRange(k)} style={{ marginRight: 6, marginBottom: 6 }}>{k.toUpperCase()}</Chip>
                ))}
              </View>
            </View>
          </GlassCard>

          {/* Totals */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <GlassCard style={{ flex: 1 }}><Text variant="labelSmall">Energy</Text><Text variant="titleMedium" style={{ fontWeight: '800' }}>{totals.kWh.toLocaleString()} kWh</Text></GlassCard>
            <GlassCard style={{ flex: 1 }}><Text variant="labelSmall">Cost</Text><Text variant="titleMedium" style={{ fontWeight: '800' }}>{currency} {totals.cost.toLocaleString()}</Text></GlassCard>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <GlassCard style={{ flex: 1 }}><Text variant="labelSmall">ICE CO₂</Text><Text variant="titleMedium" style={{ fontWeight: '800' }}>{totals.iceCO2.toFixed(0)} kg</Text></GlassCard>
            <GlassCard style={{ flex: 1 }}><Text variant="labelSmall">EV CO₂</Text><Text variant="titleMedium" style={{ fontWeight: '800' }}>{totals.evCO2.toFixed(0)} kg</Text></GlassCard>
          </View>
          <GlassCard style={{ marginTop: 10 }}>
            <Text variant="labelLarge" style={{ fontWeight: '800', marginBottom: 6 }}>CO₂ saved</Text>
            <Text variant="titleMedium" style={{ fontWeight: '800' }}>{totals.saved.toFixed(0)} kg</Text>
            <Text variant="labelSmall" style={{ opacity: 0.7 }}>vs comparable ICE travel</Text>
          </GlassCard>

          {/* Charts */}
          <GlassCard style={{ marginTop: 12 }}>
            <Text variant="labelLarge" style={{ fontWeight: '800', marginBottom: 6 }}>Energy (kWh)</Text>
            <Area data={daily} />
          </GlassCard>
          <GlassCard style={{ marginTop: 12, marginBottom: 120 }}>
            <Text variant="labelLarge" style={{ fontWeight: '800', marginBottom: 6 }}>CO₂ per day (ICE vs EV)</Text>
            <Bars data={compareBars} />
          </GlassCard>
        </ScrollView>
        {/* Tabs are provided globally; removing nested BottomNavigation. */}
      </View>
    </PaperProvider>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f2f2f2' },
  content: { padding: 16 },
  
  blurCard: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#ffffff' },
  blurInner: { padding: 12, backgroundColor: Platform.select({ ios: '#ffffff', android: '#ffffff' }) },
});
