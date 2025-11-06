import { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Platform, Modal } from 'react-native';
import { router } from 'expo-router';
import {
  Provider as PaperProvider,
  MD3LightTheme as DefaultTheme,
  Appbar,
  Text,
  Button,
  
  TextInput,
  List,
} from 'react-native-paper';
import { BlurView } from 'expo-blur';

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary:'#03cd8c', secondary:'#f77f00', background:'#f2f2f2', surface:'rgba(255,255,255,0.7)' }, roundness:14 };

export type AuditCommandLogProps = {
  chargers?: { id:string; name:string }[]; defaultChargerId?: string;
  onBack?: ()=>void; onHelp?: ()=>void; onNavChange?: (v:number)=>void;
  onExportAudit?: (payload:any)=>void; onOpenEntry?: (payload:any)=>void;
};

function GlassCard({ children, style }:{ children: React.ReactNode; style?: any }){
  return (
    <BlurView intensity={Platform.OS==='ios'?35:50} tint="light" style={[styles.blurCard, style]}>
      <View style={styles.blurInner}>{children}</View>
    </BlurView>
  );
}

function AuditRow({ a, onOpen }:{ a:any; onOpen?:(a:any)=>void }){
  return (
    <GlassCard>
      <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
        <View>
          <Text variant="titleSmall" style={{ fontWeight:'700' }}>{a.action}</Text>
          <Text variant="labelSmall" style={{ opacity:0.7 }}>{a.time} • {a.user} • IP {a.ip}</Text>
        </View>
        <Button compact onPress={()=>onOpen?.(a)}>Open</Button>
      </View>
    </GlassCard>
  );
}

export default function AuditCommandLog({
  chargers=[{id:'st1',name:'Home Charger'},{id:'st2',name:'Office Charger'}], defaultChargerId='st1',
  onBack, onHelp, onNavChange, onExportAudit, onOpenEntry
}: AuditCommandLogProps){
  const [navValue, setNavValue] = useState(1);
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [query, setQuery] = useState('');

  const initial = useMemo(()=>({
    st1: [
      { id:'a1', time:'2025-10-18 14:22', user:'Robert', action:'Unlock connector 1', ip:'203.0.113.1' },
      { id:'a2', time:'2025-10-18 14:30', user:'Albert', action:'Start session', ip:'203.0.113.2' }
    ],
    st2: [ { id:'b1', time:'2025-10-12 09:10', user:'Robert', action:'Reboot charger', ip:'203.0.113.3' } ]
  }) as Record<string, { id: string; time: string; user: string; action: string; ip: string; }[]>, []); // add index signature + deps

  const all = (initial[chargerId as keyof typeof initial] ?? []) as {
    id: string;
    time: string;
    user: string;
    action: string;
    ip: string;
  }[];

  const filtered = all.filter((a) =>
    (!from || a.time >= from) &&
    (!to || a.time <= to) &&
    (!query || a.action.toLowerCase().includes(query.toLowerCase()))
  );

  const Footer = (
    <View style={styles.footer}>
      <TextInput mode="outlined" placeholder="Search" value={query} onChangeText={setQuery} style={{ flex:1, marginRight: 6 }} />
      <TextInput mode="outlined" label="From" value={from} onChangeText={setFrom} style={{ width: 140, marginRight: 6 }} />
      <TextInput mode="outlined" label="To" value={to} onChangeText={setTo} style={{ width: 140, marginRight: 6 }} />
      <Button mode="contained" buttonColor={theme.colors.secondary} textColor="#fff" onPress={()=> onExportAudit?.({ chargerId, from, to, query, count: filtered.length })}>Export</Button>
    </View>
  );

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<any|null>(null);
  const openEntry = (a:any)=> { setActive(a); setOpen(true); onOpenEntry?.({ chargerId, entry:a }); };

  return (
    <PaperProvider theme={theme}>
      <View style={styles.root}>
        <Appbar.Header mode="small" elevated>
          <Appbar.Action icon="arrow-left" onPress={() => (onBack ? onBack() : router.back())} />
          <Appbar.Content title="Audit & command log" titleStyle={{ fontWeight:'700' }} subtitle="who • what • when • where" />
          <Appbar.Action icon="help-circle-outline" onPress={onHelp} />
        </Appbar.Header>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Charger selector */}
          <GlassCard>
            <Text variant="labelLarge" style={{ fontWeight:'800', marginBottom: 6 }}>My chargers</Text>
            <TextInput mode="outlined" value={chargers.find(c=>c.id===chargerId)?.name} right={<TextInput.Icon icon="menu-down" />} onFocus={()=>{}} />
          </GlassCard>

          {/* List */}
          <View style={{ marginTop:12 }}>
            {filtered.map(a => (
              <View key={a.id} style={{ marginBottom: 10 }}>
                <AuditRow a={a} onOpen={openEntry} />
              </View>
            ))}
            {!filtered.length && (
              <GlassCard>
                <Text variant="labelSmall" style={{ textAlign:'center', opacity:0.7 }}>No entries for the selected filters.</Text>
              </GlassCard>
            )}
          </View>
        </ScrollView>

        {/* Tabs handled globally */}
      </View>

      {/* Entry modal */}
      <Modal visible={open} onRequestClose={()=>setOpen(false)}>
        <View style={{ flex:1, justifyContent:'center', padding:24, backgroundColor:'rgba(0,0,0,0.25)' }}>
          <GlassCard>
            <Text variant="titleMedium" style={{ fontWeight:'800' }}>Entry detail</Text>
            {active ? (
              <View style={{ marginTop: 6 }}>
                <Text variant="bodySmall"><Text style={{ fontWeight:'700' }}>Action:</Text> {active.action}</Text>
                <Text variant="bodySmall"><Text style={{ fontWeight:'700' }}>Time:</Text> {active.time}</Text>
                <Text variant="bodySmall"><Text style={{ fontWeight:'700' }}>User:</Text> {active.user}</Text>
                <Text variant="bodySmall"><Text style={{ fontWeight:'700' }}>IP:</Text> {active.ip}</Text>
              </View>
            ) : null}
            <View style={{ flexDirection:'row', justifyContent:'flex-end', marginTop: 8 }}>
              <Button onPress={()=>setOpen(false)}>Close</Button>
            </View>
          </GlassCard>
        </View>
      </Modal>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  root:{ flex:1, backgroundColor:'#f2f2f2' },
  content:{ padding:16 },
  
  blurCard:{ borderRadius:14, overflow:'hidden', borderWidth:1, borderColor:'rgba(255,255,255,0.55)' },
  blurInner:{ padding:12, backgroundColor: Platform.select({ ios:'rgba(255,255,255,0.2)', android:'rgba(255,255,255,0.35)' }) },
  footer:{ flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingBottom:12 + Number(Platform.select({ ios: 8, android: 0 })), paddingTop:12, backgroundColor:'#f2f2f2', borderTopWidth:StyleSheet.hairlineWidth, borderTopColor:'#e9eceb' },
});
