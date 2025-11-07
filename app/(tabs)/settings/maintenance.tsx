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
  Checkbox,
  IconButton,
} from 'react-native-paper';

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary:'#03cd8c', secondary:'#f77f00', background:'#f2f2f2', surface:'#ffffff' }, roundness:14 };

export type MaintenanceRemindersProps = {
  chargers?: { id:string; name:string }[]; defaultChargerId?: string;
  onBack?: ()=>void; onHelp?: ()=>void; onNavChange?: (v:number)=>void;
  onSaveReminders?: (payload:any)=>void; onExportCalendar?: (payload:any)=>void;
};

function GlassCard({ children, style }:{ children: React.ReactNode; style?: any }){
  return (
    <View style={[styles.blurCard, style]}>
      <View style={styles.blurInner}>{children}</View>
    </View>
  );
}

function ReminderRow({ r, onToggle, onDelete }:{ r:any; onToggle:(r:any)=>void; onDelete:(r:any)=>void }){
  return (
    <GlassCard>
      <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
        <View style={{ flexDirection:'row', alignItems:'center' }}>
          <Checkbox status={r.done?'checked':'unchecked'} onPress={()=>onToggle(r)} />
          <View>
            <Text variant="titleSmall" style={{ fontWeight:'700' }}>{r.title}</Text>
            <Text variant="labelSmall" style={{ opacity:0.7 }}>{r.when} • {r.kind}</Text>
          </View>
        </View>
        <IconButton icon="delete-outline" iconColor="#d32f2f" onPress={()=>onDelete(r)} />
      </View>
    </GlassCard>
  );
}

export default function MaintenanceReminders({
  chargers=[{id:'st1',name:'Home Charger'},{id:'st2',name:'Office Charger'}], defaultChargerId='st1',
  onBack, onHelp, onNavChange, onSaveReminders, onExportCalendar
}: MaintenanceRemindersProps){
  const [navValue, setNavValue] = useState(1);
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title:'', when:'', kind:'Inspection' });

  const initial = useMemo(()=>({
    st1: [{ id:'r1', title:'Filter change', when:'2025-11-01 10:00', kind:'Filter', done:false }],
    st2: [{ id:'r2', title:'Safety inspection', when:'2025-11-05 09:00', kind:'Inspection', done:false }]
  }), []);
  const [byCharger, setByCharger] = useState<Record<string, any[]>>(initial);
  const reminders = byCharger[chargerId] || [];

  const addReminder = () => { const r = { id: `r${Date.now()}`, ...form, done:false }; setByCharger(prev=>({ ...prev, [chargerId]: [...(prev[chargerId]||[]), r] })); setAddOpen(false); setForm({ title:'', when:'', kind:'Inspection' }); };
  const toggle = (r:any)=> setByCharger(prev=>({ ...prev, [chargerId]: (prev[chargerId]||[]).map(x=> x.id===r.id ? { ...x, done:!x.done } : x) }));
  const removeR = (r:any)=> setByCharger(prev=>({ ...prev, [chargerId]: (prev[chargerId]||[]).filter(x=> x.id!==r.id) }));

  const Footer = (
    <View style={styles.footer}>
      <Button mode="outlined" icon="calendar" onPress={()=> onExportCalendar?.({ chargerId, reminders })}>Export calendar</Button>
      <Button mode="contained" buttonColor={theme.colors.secondary} textColor="#fff" onPress={()=> setAddOpen(true)} icon="plus">Add reminder</Button>
      <Button mode="contained" buttonColor={theme.colors.secondary} textColor="#fff" onPress={()=> onSaveReminders?.({ chargerId, reminders })} style={{ marginLeft:'auto' }}>Save</Button>
    </View>
  );

  return (
    <PaperProvider theme={theme}>
      <View style={styles.root}>
        <Appbar.Header mode="small" elevated>
          <Appbar.Action icon="arrow-left" onPress={() => (onBack ? onBack() : router.back())} />
          <Appbar.Content title="Maintenance & reminders" titleStyle={{ fontWeight:'700' }} subtitle="create • schedule • complete" />
          <Appbar.Action icon="help-circle-outline" onPress={onHelp} />
        </Appbar.Header>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Charger selector */}
          <GlassCard>
            <Text variant="labelLarge" style={{ fontWeight:'800', marginBottom: 6 }}>My chargers</Text>
            <TextInput mode="outlined" value={chargers.find(c=>c.id===chargerId)?.name} right={<TextInput.Icon icon="menu-down" />} onFocus={()=>{}} />
          </GlassCard>

          {/* Reminders */}
          <View style={{ marginTop:12 }}>
            {reminders.map(r => (
              <View key={r.id} style={{ marginBottom: 10 }}>
                <ReminderRow r={r} onToggle={toggle} onDelete={removeR} />
              </View>
            ))}
            {!reminders.length && (
              <GlassCard style={{ marginTop: 6 }}>
                <Text variant="labelSmall" style={{ textAlign:'center', opacity:0.7 }}>No reminders yet. Add one below.</Text>
              </GlassCard>
            )}
          </View>
        </ScrollView>

        {/* Global tabs are already rendered */}
      </View>

      {/* Add dialog */}
      <Modal visible={addOpen} onRequestClose={()=>setAddOpen(false)}>
        <View style={{ flex:1, justifyContent:'center', padding:24, backgroundColor:'rgba(0,0,0,0.25)' }}>
          <GlassCard>
            <Text variant="titleMedium" style={{ fontWeight:'800' }}>New reminder</Text>
            <View style={{ height: 8 }} />
            <View style={{ gap: 10 }}>
              <TextInput label="Title" value={form.title} onChangeText={v=>setForm(f=>({ ...f, title:v }))} mode="outlined" />
              <TextInput label="When" value={form.when} onChangeText={v=>setForm(f=>({ ...f, when:v }))} mode="outlined" placeholder="YYYY-MM-DD hh:mm" />
              <TextInput label="Type" value={form.kind} onChangeText={v=>setForm(f=>({ ...f, kind:v }))} mode="outlined" />
              <View style={{ flexDirection:'row', justifyContent:'flex-end' }}>
                <Button onPress={()=>setAddOpen(false)}>Cancel</Button>
                <Button mode="contained" buttonColor={theme.colors.secondary} textColor="#fff" onPress={addReminder} style={{ marginLeft: 8 }}>Add</Button>
              </View>
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
  
  blurCard:{ borderRadius:14, overflow:'hidden', borderWidth:1, borderColor:'#ffffff' },
  blurInner:{ padding:12, backgroundColor: Platform.select({ ios:'#ffffff', android:'#ffffff' }) },
  footer:{ flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingBottom:12 + Number(Platform.select({ ios: 8, android: 0 })), paddingTop:12, backgroundColor:'#f2f2f2', borderTopWidth:StyleSheet.hairlineWidth, borderTopColor:'#e9eceb' },
});
