import { useState } from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import {
  Provider as PaperProvider,
  MD3LightTheme as DefaultTheme,
  Appbar,
  Text,
  Button,
  Card,
  TextInput,
  Checkbox,
  Chip,
  
} from 'react-native-paper';
import { BlurView } from 'expo-blur';

const theme = { ...DefaultTheme, colors:{ ...DefaultTheme.colors, primary:'#03cd8c', secondary:'#f77f00', background:'#f2f2f2', surface:'rgba(255,255,255,0.7)' }, roundness:14 };

export type DataExportCenterProps = {
  chargers?: { id:string; name:string }[]; defaultChargerId?: string;
  onBack?: ()=>void; onHelp?: ()=>void; onNavChange?: (v:number)=>void;
  onExport?: (p:any)=>void;
  onOpenSessions?: (p:{ chargerId:string; from?:string; to?:string })=>void;
  onOpenFaults?: (p:{ chargerId:string; from?:string; to?:string })=>void;
  onOpenInvoices?: (p:{ chargerId:string; from?:string; to?:string })=>void;
};

function GlassCard({ children, style }:{ children: React.ReactNode; style?: any }){
  return (
    <BlurView intensity={Platform.OS==='ios'?35:50} tint="light" style={[styles.blurCard, style]}>
      <View style={styles.blurInner}>{children}</View>
    </BlurView>
  );
}

function EntityRow({ label, checked, onToggle, children }:{ label:string; checked:boolean; onToggle:()=>void; children?:React.ReactNode }){
  return (
    <GlassCard>
      <View style={{ gap:6 }}>
        <View style={{ flexDirection:'row', alignItems:'center' }}>
          <Checkbox status={checked? 'checked':'unchecked'} onPress={onToggle} />
          <Text>{label}</Text>
        </View>
        {checked && <View style={{ paddingLeft: 6 }}>{children}</View>}
      </View>
    </GlassCard>
  );
}

export default function DataExportCenter({
  chargers=[{id:'st1',name:'Home Charger'},{id:'st2',name:'Office Charger'}], defaultChargerId='st1',
  onBack, onHelp, onNavChange, onExport, onOpenSessions, onOpenFaults, onOpenInvoices
}: DataExportCenterProps){
  const [navValue,setNavValue]=useState(1);
  const [chargerId,setChargerId]=useState(defaultChargerId);
  const [from,setFrom]=useState('');
  const [to,setTo]=useState('');
  const [format,setFormat]=useState<'csv'|'xlsx'|'json'>('csv');
  const [compress,setCompress]=useState(false);
  const [anonymize,setAnonymize]=useState(true);

  const [entities,setEntities]=useState({ sessions:true, faults:false, invoices:false, reservations:false });
  const fields = {
    sessions:['id','site','kWh','start','end','amount'],
    faults:['code','title','time','connector'],
    invoices:['id','date','site','amount','status'],
    reservations:['id','user','connector','date','start','end','status'],
  } as const;

  const selected = Object.keys(entities).filter(k=> (entities as any)[k]);
  const exportNow = ()=> onExport?.({ chargerId, from, to, format, compress, anonymize, entities:selected, fields: Object.fromEntries(selected.map(k=> [k, (fields as any)[k]])) });

  const Footer=(
    <View style={styles.footer}>
      <Button mode="outlined" icon="share-variant" onPress={exportNow}>Export</Button>
      <Chip style={{ marginLeft:'auto' }}>{format.toUpperCase()}</Chip>
      <Button mode="text" onPress={()=> setFormat(f=> f==='csv'?'xlsx': f==='xlsx'?'json':'csv')}>Change</Button>
    </View>
  );

  return (
    <PaperProvider theme={theme}>
      <View style={styles.root}>
        <Appbar.Header mode="small" elevated>
          <Appbar.Action icon="arrow-left" onPress={() => (onBack ? onBack() : router.back())}/>
          <Appbar.Content title="Data export center" titleStyle={{ fontWeight:'700' }} subtitle="choose • preview • export" />
          <Appbar.Action icon="help-circle-outline" onPress={onHelp}/>
        </Appbar.Header>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Scope */}
          <GlassCard>
            <TextInput mode="outlined" value={chargers.find(c=>c.id===chargerId)?.name} right={<TextInput.Icon icon="menu-down" />} onFocus={()=>{}} />
            <View style={{ flexDirection:'row', gap:8, marginTop:8 }}>
              <TextInput label="From" mode="outlined" value={from} onChangeText={setFrom} style={{ flex:1 }} />
              <TextInput label="To" mode="outlined" value={to} onChangeText={setTo} style={{ flex:1 }} />
            </View>
          </GlassCard>

          {/* Entities */}
          <View style={{ marginTop:12, gap:8 }}>
            <EntityRow label="Sessions" checked={entities.sessions} onToggle={()=> setEntities(s=>({ ...s, sessions: !s.sessions }))}>
              <View style={{ flexDirection:'row', alignItems:'center' }}>
              <Text variant="labelSmall">Fields: {fields.sessions.join(', ')}</Text>
                <Button compact mode="outlined" style={{ marginLeft:'auto' }} onPress={()=> onOpenSessions?.({ chargerId, from, to })}>Open (19)</Button>
              </View>
            </EntityRow>
            <EntityRow label="Faults" checked={entities.faults} onToggle={()=> setEntities(s=>({ ...s, faults: !s.faults }))}>
              <View style={{ flexDirection:'row', alignItems:'center' }}>
                <Text variant="labelSmall">Fields: {fields.faults.join(', ')}</Text>
                <Button compact mode="outlined" style={{ marginLeft:'auto' }} onPress={()=> onOpenFaults?.({ chargerId, from, to })}>Open (21)</Button>
              </View>
            </EntityRow>
            <EntityRow label="Invoices" checked={entities.invoices} onToggle={()=> setEntities(s=>({ ...s, invoices: !s.invoices }))}>
              <View style={{ flexDirection:'row', alignItems:'center' }}>
                <Text variant="labelSmall">Fields: {fields.invoices.join(', ')}</Text>
                <Button compact mode="outlined" style={{ marginLeft:'auto' }} onPress={()=> onOpenInvoices?.({ chargerId, from, to })}>Open (29)</Button>
              </View>
            </EntityRow>
            <EntityRow label="Reservations" checked={entities.reservations} onToggle={()=> setEntities(s=>({ ...s, reservations: !s.reservations }))}>
              <View style={{ flexDirection:'row', alignItems:'center' }}>
                <Text variant="labelSmall">Fields: {fields.reservations.join(', ')}</Text>
              </View>
            </EntityRow>
          </View>

          {/* Options */}
          <GlassCard style={{ marginTop:12, marginBottom:120 }}>
            <View style={{ flexDirection:'row', alignItems:'center' }}>
              <Checkbox status={compress?'checked':'unchecked'} onPress={()=> setCompress(v=>!v)} />
              <Text>Compress (zip)</Text>
            </View>
            <View style={{ flexDirection:'row', alignItems:'center' }}>
              <Checkbox status={anonymize?'checked':'unchecked'} onPress={()=> setAnonymize(v=>!v)} />
              <Text>Anonymize PII</Text>
            </View>
          </GlassCard>
        </ScrollView>
        {/* Tabs rendered globally; removed BottomNavigation duplication */}
        {Footer}
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  root:{ flex:1, backgroundColor:'#f2f2f2' },
  content:{ padding:16 },
  
  footer:{ flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingBottom:12 + Number(Platform.select({ ios: 8, android: 0 })), paddingTop:12, backgroundColor:'#f2f2f2', borderTopWidth:StyleSheet.hairlineWidth, borderTopColor:'#e9eceb' },
  blurCard:{ borderRadius:14, overflow:'hidden', borderWidth:1, borderColor:'rgba(255,255,255,0.55)' },
  blurInner:{ padding:12, backgroundColor: Platform.select({ ios:'rgba(255,255,255,0.2)', android:'rgba(255,255,255,0.35)' }) },
});
