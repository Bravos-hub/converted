import { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Platform, Modal } from 'react-native';
import { router } from 'expo-router';
import {
  Provider as PaperProvider,
  MD3LightTheme as DefaultTheme,
  Appbar,
  Text,
  Button,
  Chip,
  
  Switch,
  TextInput,
  List,
  Checkbox,
} from 'react-native-paper';
import { BlurView } from 'expo-blur';

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary:'#03cd8c', secondary:'#f77f00', background:'#f2f2f2', surface:'rgba(255,255,255,0.7)' }, roundness:14 };

export type NotificationsRulesProps = {
  chargers?: { id:string; name:string }[];
  users?: { id:string; name:string }[];
  defaultChargerId?: string;
  onBack?: ()=>void; onHelp?: ()=>void; onNavChange?: (v:number)=>void;
  onSaveRules?: (payload:any)=>void; onTestNotification?: (payload:any)=>void;
};

function GlassCard({ children, style }:{ children: React.ReactNode; style?: any }){
  return (
    <BlurView intensity={Platform.OS==='ios'?35:50} tint="light" style={[styles.blurCard, style]}>
      <View style={styles.blurInner}>{children}</View>
    </BlurView>
  );
}

export default function NotificationsRules({
  chargers=[{id:'st1',name:'Home Charger'},{id:'st2',name:'Office Charger'}],
  users=[{id:'u1', name:'Robert Fox'},{id:'u2',name:'Albert Flores'}],
  defaultChargerId='st1', onBack, onHelp, onNavChange, onSaveRules, onTestNotification
}: NotificationsRulesProps){
  const [navValue, setNavValue] = useState(1);
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [rules, setRules] = useState({ overTemp:true, tempC:70, overCurrent:true, currentA:120, offline:true, offlineMin:10, channels:{ app:true, rfid:false, email:true } });
  const [recipients, setRecipients] = useState<string[]>(['u1']);
  const [preview, setPreview] = useState(false);

  const toggleR = (id:string)=> setRecipients(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id]);

  const Footer = (
    <View style={styles.footer}>
      <Button mode="outlined" icon="bell-outline" onPress={()=> (onTestNotification ? onTestNotification({ chargerId, recipients }) : setPreview(true))}>Send test</Button>
      <Button mode="contained" buttonColor={theme.colors.secondary} textColor="#fff" onPress={()=> onSaveRules?.({ chargerId, rules, recipients })} style={{ marginLeft: 'auto' }}>Save rules</Button>
    </View>
  );

  return (
    <PaperProvider theme={theme}>
      <View style={styles.root}>
        <Appbar.Header mode="small" elevated>
          <Appbar.Action icon="arrow-left" onPress={() => (onBack ? onBack() : router.back())} />
          <Appbar.Content title="Notifications & rules" titleStyle={{ fontWeight:'700' }} subtitle="thresholds • recipients • channels" />
          <Appbar.Action icon="help-circle-outline" onPress={onHelp} />
        </Appbar.Header>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Charger selector */}
          <GlassCard>
            <Text variant="labelLarge" style={{ fontWeight:'800', marginBottom: 6 }}>My chargers</Text>
            <TextInput mode="outlined" value={chargers.find(c=>c.id===chargerId)?.name} right={<TextInput.Icon icon="menu-down" />} onFocus={()=>{}} />
          </GlassCard>

          {/* Thresholds */}
          <GlassCard style={{ marginTop: 12 }}>
            <Text variant="labelLarge" style={{ fontWeight:'800', marginBottom: 6 }}>Thresholds</Text>
            <View style={{ gap: 10 }}>
              <View style={styles.row}><Text style={styles.flexRowLabel}>Over‑temperature</Text><Switch value={rules.overTemp} onValueChange={(v)=>setRules(r=>({...r, overTemp:v}))} /><TextInput mode="outlined" label="°C" value={String(rules.tempC)} onChangeText={(v)=>setRules(r=>({...r, tempC: Number(v)||0}))} style={{ width: 110, marginLeft: 8 }} keyboardType="numeric" /></View>
              <View style={styles.row}><Text style={styles.flexRowLabel}>Over‑current</Text><Switch value={rules.overCurrent} onValueChange={(v)=>setRules(r=>({...r, overCurrent:v}))} /><TextInput mode="outlined" label="A" value={String(rules.currentA)} onChangeText={(v)=>setRules(r=>({...r, currentA: Number(v)||0}))} style={{ width: 110, marginLeft: 8 }} keyboardType="numeric" /></View>
              <View style={styles.row}><Text style={styles.flexRowLabel}>Offline</Text><Switch value={rules.offline} onValueChange={(v)=>setRules(r=>({...r, offline:v}))} /><TextInput mode="outlined" label="Min" value={String(rules.offlineMin)} onChangeText={(v)=>setRules(r=>({...r, offlineMin: Number(v)||0}))} style={{ width: 110, marginLeft: 8 }} keyboardType="numeric" /></View>
            </View>
          </GlassCard>

          {/* Channels */}
          <GlassCard style={{ marginTop: 12 }}>
            <Text variant="labelLarge" style={{ fontWeight:'800', marginBottom: 6 }}>Channels</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Chip selected={rules.channels.app} onPress={()=>setRules(r=>({...r, channels:{...r.channels, app:!r.channels.app}}))} style={{ marginRight: 6 }}>App</Chip>
              <Chip selected={rules.channels.rfid} onPress={()=>setRules(r=>({...r, channels:{...r.channels, rfid:!r.channels.rfid}}))} style={{ marginRight: 6 }}>RFID</Chip>
              <Chip selected={rules.channels.email} onPress={()=>setRules(r=>({...r, channels:{...r.channels, email:!r.channels.email}}))}>Email</Chip>
            </View>
          </GlassCard>

          {/* Recipients */}
          <GlassCard style={{ marginTop: 12, marginBottom: 120 }}>
            <Text variant="labelLarge" style={{ fontWeight:'800', marginBottom: 6 }}>Recipients</Text>
            <List.Section>
              {users.map(u => (
                <List.Item key={u.id} title={u.name} left={() => <Checkbox status={recipients.includes(u.id)?'checked':'unchecked'} onPress={()=>toggleR(u.id)} />} onPress={()=>toggleR(u.id)} />
              ))}
            </List.Section>
          </GlassCard>
        </ScrollView>

        {/* Tabs are provided by the main app layout */}
      </View>

      {/* Preview modal (stub) */}
      <Modal visible={preview} onRequestClose={()=>setPreview(false)}>
        <View style={{ flex:1, justifyContent:'center', padding:24, backgroundColor:'rgba(0,0,0,0.25)' }}>
          <GlassCard>
            <Text variant="titleMedium" style={{ fontWeight:'800' }}>Test notification</Text>
            <Text variant="bodySmall" style={{ marginTop:6 }}>Would send to: {users.filter(u=>recipients.includes(u.id)).map(u=>u.name).join(', ')||'None'}.</Text>
            <Button mode="contained" onPress={()=>setPreview(false)} style={{ marginTop:8 }}>Close</Button>
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
  row:{ flexDirection:'row', alignItems:'center' },
  flexRowLabel:{ flex:1 }
});
