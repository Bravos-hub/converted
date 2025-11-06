import { useState } from 'react';
import { View, ScrollView, StyleSheet, Platform, Modal } from 'react-native';
import { router } from 'expo-router';
import {
  Provider as PaperProvider,
  MD3LightTheme as DefaultTheme,
  Appbar,
  Text,
  Button,
  Chip,
  
  TextInput,
  Divider,
} from 'react-native-paper';
import { BlurView } from 'expo-blur';

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary:'#03cd8c', secondary:'#f77f00', background:'#f2f2f2', surface:'rgba(255,255,255,0.7)' }, roundness:14 };

type StepKey = 'power'|'network'|'rcd'|'connector';
const STEPS: { key: StepKey; label: string }[] = [
  { key:'power', label:'Power' },
  { key:'network', label:'Network' },
  { key:'rcd', label:'RCD' },
  { key:'connector', label:'Connector' },
];

function GlassCard({ children, style }:{ children: React.ReactNode; style?: any }){
  return (
    <BlurView intensity={Platform.OS==='ios'?35:50} tint="light" style={[styles.blurCard, style]}>
      <View style={styles.blurInner}>{children}</View>
    </BlurView>
  );
}

export type TroubleshootingWizardProps = {
  chargers?: { id:string; name:string }[]; defaultChargerId?: string;
  onBack?: ()=>void; onHelp?: ()=>void; onNavChange?: (v:number)=>void;
  onRestartSession?: (p:{chargerId:string})=>void; onResetConnector?: (p:{chargerId:string})=>void; onRebootCharger?: (p:{chargerId:string})=>void; onSaveNotes?: (p:{chargerId:string; notes:string})=>void;
};

export default function TroubleshootingWizard({
  chargers=[{id:'st1',name:'Home Charger'},{id:'st2',name:'Office Charger'}], defaultChargerId='st1',
  onBack, onHelp, onNavChange, onRestartSession, onResetConnector, onRebootCharger, onSaveNotes
}: TroubleshootingWizardProps){
  const [navValue, setNavValue] = useState(1);
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [active, setActive] = useState(0);
  const [notes, setNotes] = useState('');

  const step = STEPS[active];
  const next = () => setActive(i=> Math.min(i+1, STEPS.length-1));
  const back = () => setActive(i=> Math.max(i-1, 0));

  const Quick = (
    <View style={{ flexDirection:'row', flexWrap:'wrap', gap:6 }}>
      <Button mode="outlined" icon="restart" onPress={()=>onRestartSession?.({ chargerId })}>Restart session</Button>
      <Button mode="outlined" icon="tools" onPress={()=>onResetConnector?.({ chargerId })}>Reset connector</Button>
      <Button mode="outlined" textColor="#d32f2f" icon="reload" onPress={()=>onRebootCharger?.({ chargerId })}>Reboot charger</Button>
    </View>
  );

  const StepBody = () => (
    <View style={{ gap: 8 }}>
      {step.key==='power' && (
        <>
          <Text variant="bodySmall">• Verify mains power; ensure breaker is ON.</Text>
          <Text variant="bodySmall">• Confirm input voltage within spec.</Text>
          {Quick}
        </>
      )}
      {step.key==='network' && (
        <>
          <Text variant="bodySmall">• Check Ethernet/Wi‑Fi/LTE connectivity.</Text>
          <Text variant="bodySmall">• Confirm OCPP server reachable.</Text>
          {Quick}
        </>
      )}
      {step.key==='rcd' && (
        <>
          <Text variant="bodySmall">• Test residual current device (RCD).</Text>
          <Text variant="bodySmall">• Reset and verify no fault LEDs.</Text>
          {Quick}
        </>
      )}
      {step.key==='connector' && (
        <>
          <Text variant="bodySmall">• Inspect connector pins; clean debris.</Text>
          <Text variant="bodySmall">• Try another cable/vehicle if available.</Text>
          {Quick}
        </>
      )}
      <Divider style={{ marginVertical: 8 }} />
      <TextInput mode="outlined" label="Notes" placeholder="What did you find?" value={notes} onChangeText={setNotes} multiline />
    </View>
  );

  const Footer = (
    <View style={styles.footer}>
      <Button mode="outlined" onPress={back} disabled={active===0}>Back</Button>
      {active < STEPS.length-1 ? (
        <Button mode="contained" buttonColor={theme.colors.secondary} textColor="#fff" onPress={next} style={{ marginLeft: 8 }}>Next</Button>
      ) : (
        <Button mode="contained" buttonColor={theme.colors.secondary} textColor="#fff" onPress={()=>onSaveNotes?.({ chargerId, notes })} style={{ marginLeft: 8 }}>Finish</Button>
      )}
    </View>
  );

  return (
    <PaperProvider theme={theme}>
      <View style={styles.root}>
        <Appbar.Header mode="small" elevated>
          <Appbar.Action icon="arrow-left" onPress={() => (onBack ? onBack() : router.back())} />
          <Appbar.Content title="Troubleshooting wizard" titleStyle={{ fontWeight:'700' }} subtitle="guided steps • quick actions" />
          <Appbar.Action icon="help-circle-outline" onPress={onHelp} />
        </Appbar.Header>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Charger selector */}
          <GlassCard>
            <Text variant="labelLarge" style={{ fontWeight:'800', marginBottom: 6 }}>My chargers</Text>
            <TextInput mode="outlined" value={chargers.find(c=>c.id===chargerId)?.name} right={<TextInput.Icon icon="menu-down" />} onFocus={()=>{}} />
          </GlassCard>

          {/* Stepper (chips) */}
          <GlassCard style={{ marginTop: 12 }}>
            <View style={{ flexDirection:'row', flexWrap:'wrap', gap:6 }}>
              {STEPS.map((s, i)=> (
                <Chip key={s.key} mode={i===active?'flat':'outlined'} selected={i===active} onPress={()=>setActive(i)}>{s.label}</Chip>
              ))}
            </View>
            <View style={{ height: 8 }} />
            <StepBody />
          </GlassCard>
        </ScrollView>

        {/* Tabs are global; removed nested BottomNavigation */}
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
  footer:{ flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingBottom:12 + Number(Platform.select({ ios: 8, android: 0 })), paddingTop:12, backgroundColor:'#f2f2f2', borderTopWidth:StyleSheet.hairlineWidth, borderTopColor:'#e9eceb' },
});
