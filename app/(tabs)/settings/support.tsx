import { useState } from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import {
  Provider as PaperProvider,
  MD3LightTheme as DefaultTheme,
  Appbar,
  Text,
  Button,
  TextInput,
  List,
  Checkbox,
  HelperText,
} from 'react-native-paper';

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary:'#03cd8c', secondary:'#f77f00', background:'#f2f2f2', surface:'#ffffff' }, roundness:14 };

export type SupportHelpCenterProps = {
  chargers?: { id:string; name:string }[];
  defaultChargerId?: string;
  categories?: string[];
  faqs?: { q:string; a:string }[];
  prefill?: { cat?: string; subject?: string; desc?: string; attach?: boolean };
  onBack?: ()=>void; onHelp?: ()=>void; onNavChange?: (v:number)=>void;
  onOpenTicket?: (p:{ chargerId:string; cat:string; subject:string; desc:string; attach:boolean })=>void;
  onAttachLogs?: (p:{ chargerId:string })=>void;
};

function GlassCard({ children, style }:{ children: React.ReactNode; style?: any }){
  return (
    <View style={[styles.blurCard, style]}>
      <View style={styles.blurInner}>{children}</View>
    </View>
  );
}

export default function SupportHelpCenter({
  chargers=[{id:'st1',name:'Home Charger'},{id:'st2',name:'Office Charger'}],
  defaultChargerId='st1',
  categories=['Billing','Technical','Account','Other'],
  faqs=[{q:'Why is my charger offline?', a:'Check power and network connectivity, then run self‑tests.'}, { q:'How do I change pricing?', a:'Open Charger Settings → Prices and update per‑charger rates.' }],
  prefill,
  onBack, onHelp, onNavChange, onOpenTicket, onAttachLogs
}: SupportHelpCenterProps){
  const [navValue, setNavValue] = useState(1);
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [cat, setCat] = useState(prefill?.cat ?? 'Technical');
  const [subject, setSubject] = useState(prefill?.subject ?? '');
  const [desc, setDesc] = useState(prefill?.desc ?? '');
  const [attach, setAttach] = useState(prefill?.attach ?? true);

  const Footer = (
    <View style={styles.footer}>
      <Button mode="outlined" icon="paperclip" onPress={()=> onAttachLogs ? onAttachLogs({ chargerId }) : null}>Attach logs</Button>
      <Button mode="contained" buttonColor={theme.colors.secondary} textColor="#fff" icon="send"
        style={{ marginLeft: 'auto' }}
        onPress={()=> onOpenTicket?.({ chargerId, cat, subject, desc, attach })}>Submit</Button>
    </View>
  );

  return (
    <PaperProvider theme={theme}>
      <View style={styles.root}>
        <Appbar.Header mode="small" elevated>
          <Appbar.Action icon="arrow-left" onPress={() => (onBack ? onBack() : router.back())} />
          <Appbar.Content title="Support & help" titleStyle={{ fontWeight:'700' }} subtitle="contact • logs • FAQ" />
          <Appbar.Action icon="help-circle-outline" onPress={onHelp} />
        </Appbar.Header>
        <ScrollView contentContainerStyle={styles.content}>
          {prefill && (
            <GlassCard>
              <Text variant="labelSmall">Prefilled from Notifications & Rules: category <Text style={{ fontWeight:'700' }}>{prefill.cat || 'Technical'}</Text>{prefill.subject ? ` • subject "${prefill.subject}"` : ''}.</Text>
              <Button compact onPress={()=>{ setCat('Technical'); setSubject(''); setDesc(''); setAttach(true); }}>Reset to defaults</Button>
            </GlassCard>
          )}

          {/* Charger selector */}
          <GlassCard style={{ marginTop: 12 }}>
            <Text variant="labelLarge" style={{ fontWeight:'800', marginBottom: 6 }}>For charger</Text>
            <TextInput mode="outlined" value={chargers.find(c=>c.id===chargerId)?.name}
              right={<TextInput.Icon icon="menu-down" />} onFocus={()=>{}} />
          </GlassCard>

          {/* Ticket form */}
          <GlassCard style={{ marginTop: 12 }}>
            <Text variant="labelLarge" style={{ fontWeight:'800', marginBottom: 6 }}>Contact support</Text>
            <TextInput mode="outlined" label="Category" value={cat} onChangeText={setCat} />
            <View style={{ height: 8 }} />
            <TextInput label="Subject" value={subject} onChangeText={setSubject} mode="outlined" />
            <View style={{ height: 8 }} />
            <TextInput label="Describe the issue" value={desc} onChangeText={setDesc} mode="outlined" multiline numberOfLines={5} />
            <View style={{ flexDirection:'row', alignItems:'center', marginTop: 8 }}>
              <Checkbox status={attach?'checked':'unchecked'} onPress={()=>setAttach(v=>!v)} />
              <Text>Include diagnostics logs</Text>
            </View>
          </GlassCard>

          {/* FAQ */}
          <GlassCard style={{ marginTop: 12, marginBottom: 120 }}>
            <Text variant="labelLarge" style={{ fontWeight:'800', marginBottom: 6 }}>FAQs</Text>
            <List.AccordionGroup>
              {faqs.map((f,i)=> (
                <List.Accordion key={i} id={`${i}`} title={f.q}>
                  <Text variant="bodySmall">{f.a}</Text>
                </List.Accordion>
              ))}
            </List.AccordionGroup>
          </GlassCard>
        </ScrollView>
        {/* Bottom tabs are handled by (tabs) layout */}
        {Footer}
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  root:{ flex:1, backgroundColor:'#f2f2f2' },
  content:{ padding:16 },
  
  blurCard:{ borderRadius:14, overflow:'hidden', borderWidth:1, borderColor:'#ffffff' },
  blurInner:{ padding:12, backgroundColor: Platform.select({ ios:'#ffffff', android:'#ffffff' }) },
  footer:{ flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingBottom:12 + Number(Platform.select({ ios: 8, android: 0 })), paddingTop:12, backgroundColor:'#f2f2f2', borderTopWidth:StyleSheet.hairlineWidth, borderTopColor:'#e9eceb' },
});
