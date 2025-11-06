import { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Platform, Modal } from 'react-native';
import { router } from 'expo-router';
import {
  Provider as PaperProvider,
  MD3LightTheme as DefaultTheme,
  Appbar,
  Text,
  Button,
  Card,
  TextInput,
  Chip,
  IconButton,
  List,
} from 'react-native-paper';
import { BlurView } from 'expo-blur';

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary:'#03cd8c', secondary:'#f77f00', background:'#f2f2f2', surface:'rgba(255,255,255,0.7)' }, roundness:14 };

export type Template = { id:string; name:string; chargeBy:'energy'|'duration'; rate:number; vat:number; includeVat:boolean; model:'single'|'tou' };
export type TariffTemplatesLibraryProps = {
  chargers?: { id:string; name:string }[];
  connectorsByCharger?: Record<string, { id:string; name:string }[]>;
  defaultChargerId?: string;
  commercialChargerId?: string;
  selectedChargerId?: string;
  aggregatorUrl?: string;
  onOpenAggregator?: (url?:string)=>void;
  onBack?: ()=>void; onHelp?: ()=>void; onNavChange?: (v:number)=>void;
  onSaveTemplate?: (t:Template)=>void; onDeleteTemplate?: (t:Template)=>void; onApplyTemplate?: (p:{ chargerId:string; connectorId:string; template:Template })=>void;
};

function GlassCard({ children, style }:{ children: React.ReactNode; style?: any }){
  return (
    <BlurView intensity={Platform.OS==='ios'?35:50} tint="light" style={[styles.blurCard, style]}>
      <View style={styles.blurInner}>{children}</View>
    </BlurView>
  );
}

function CommercialBadge({ isCommercial }:{ isCommercial?: boolean }){
  return <Chip compact style={[styles.badge, isCommercial ? styles.badgeCommercial : styles.badgeDefault]} selectedColor="#fff">{isCommercial ? 'Commercial Charger' : 'Not commercial'}</Chip>;
}

function TemplateRow({ t, onApply, onDelete, onOpen }:{ t:Template; onApply?:(t:Template)=>void; onDelete?:(t:Template)=>void; onOpen?:(t:Template)=>void }){
  return (
    <GlassCard>
      <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
        <View>
          <Text variant="titleSmall" style={{ fontWeight:'700' }}>{t.name}</Text>
          <View style={{ flexDirection:'row', flexWrap:'wrap', marginTop:4 }}>
            <Chip compact>{`${t.chargeBy==='energy'?'UGX/kWh':'UGX/min'} ${t.rate}`}</Chip>
            <Chip compact>{t.model.toUpperCase()}</Chip>
            {t.includeVat && <Chip compact>{`VAT ${t.vat}% incl.`}</Chip>}
          </View>
        </View>
        <View style={{ flexDirection:'row', alignItems:'center' }}>
          <Button mode="outlined" icon="check" onPress={()=>onApply?.(t)} style={{ marginRight: 6 }}>Apply</Button>
          <IconButton icon="delete-outline" iconColor="#d32f2f" onPress={()=>onDelete?.(t)} />
        </View>
      </View>
    </GlassCard>
  );
}

export default function TariffTemplatesLibrary({
  chargers=[{id:'st1',name:'Home Charger'},{id:'st2',name:'Office Charger'}],
  connectorsByCharger={ st1:[{id:'all',name:'All connectors'},{id:'c1',name:'Connector 1'},{id:'c2',name:'Connector 2'}], st2:[{id:'all',name:'All connectors'},{id:'c3',name:'Connector 3'}] } as any,
  defaultChargerId='st1', commercialChargerId, selectedChargerId, aggregatorUrl, onOpenAggregator,
  onBack, onHelp, onNavChange, onSaveTemplate, onDeleteTemplate, onApplyTemplate
}: TariffTemplatesLibraryProps){
  const [navValue, setNavValue] = useState(1);
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [connectorId, setConnectorId] = useState('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState<Template>({ id:'', name:'', chargeBy:'energy', rate:1200, vat:18, includeVat:false, model:'single' });
  const [templates, setTemplates] = useState<Template[]>([
    { id:'t1', name:'Night Saver', chargeBy:'energy', rate:1000, vat:18, includeVat:true, model:'tou' },
    { id:'t2', name:'Flat All Day', chargeBy:'energy', rate:1200, vat:0, includeVat:false, model:'single' }
  ]);

  const connectorList = (connectorsByCharger as any)[chargerId] || [{id:'all',name:'All connectors'}];
  const currentId = selectedChargerId || chargerId;
  const isCommercial = !!(currentId && commercialChargerId && currentId === commercialChargerId);

  const openEditor = () => { setForm({ id:'', name:'', chargeBy:'energy', rate:1200, vat:18, includeVat:false, model:'single' }); setEditorOpen(true); };
  const saveTemplate = () => { const t = { ...form, id:`t${Date.now()}` }; setTemplates(prev=>[...prev, t]); onSaveTemplate?.(t); setEditorOpen(false); };
  const deleteT = (t:Template)=> { setTemplates(prev=> prev.filter(x=>x.id!==t.id)); onDeleteTemplate?.(t); };
  const applyT = (t:Template)=> { onApplyTemplate?.({ chargerId: currentId, connectorId, template: t }); };

  const Footer = (
    <View style={styles.footer}>
      <Button mode="outlined" icon="content-save" onPress={openEditor}>New template</Button>
    </View>
  );

  return (
    <PaperProvider theme={theme}>
      <View style={styles.root}>
        <Appbar.Header mode="small" elevated>
          <Appbar.Action icon="arrow-left" onPress={() => (onBack ? onBack() : router.back())} />
          <Appbar.Content title="Tariff templates" titleStyle={{ fontWeight:'700' }} subtitle="save • reuse • apply" />
          <Appbar.Action icon="help-circle-outline" onPress={onHelp} />
        </Appbar.Header>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Scope */}
          <GlassCard>
            <View style={{ flexDirection:'row', alignItems:'center' }}>
              <TextInput mode="outlined" value={chargers.find(c=>c.id===chargerId)?.name} style={{ flex:1, marginRight: 8 }} right={<TextInput.Icon icon="menu-down" />} onFocus={()=>{}} />
              <TextInput mode="outlined" value={connectorList.find((c:any)=>c.id===connectorId)?.name} style={{ flex:1 }} right={<TextInput.Icon icon="menu-down" />} onFocus={()=>{}} />
            </View>
          </GlassCard>

          {/* Commercial badge + Aggregator CTA */}
          <View style={{ flexDirection:'row', alignItems:'center', marginTop:8 }}>
            <CommercialBadge isCommercial={isCommercial} />
            {!isCommercial && (
              <Button mode="text" onPress={()=> onOpenAggregator?.(aggregatorUrl)} style={{ marginLeft:8 }}>Aggregator & CPMS</Button>
            )}
          </View>

          {/* Templates */}
          <View style={{ marginTop:12 }}>
            {templates.map(t => (
              <View key={t.id} style={{ marginBottom:10 }}>
                <TemplateRow t={t} onApply={applyT} onDelete={deleteT} onOpen={(x)=>{}} />
              </View>
            ))}
            {!templates.length && (
              <GlassCard>
                <Text variant="labelSmall" style={{ textAlign:'center', opacity:0.7 }}>No templates yet. Create one below.</Text>
              </GlassCard>
            )}
          </View>
        </ScrollView>
        {/* Global tabs exist; no nested BottomNavigation */}
        {Footer}
      </View>

      {/* Editor */}
      <Modal visible={editorOpen} onRequestClose={()=>setEditorOpen(false)}>
        <View style={{ flex:1, justifyContent:'center', padding:24, backgroundColor:'rgba(0,0,0,0.25)' }}>
          <GlassCard>
            <Text variant="titleMedium" style={{ fontWeight:'800' }}>New tariff template</Text>
            <View style={{ height:8 }} />
            <TextInput label="Name" value={form.name} onChangeText={v=>setForm(f=>({ ...f, name:v }))} mode="outlined" />
            <View style={{ height:8 }} />
            <TextInput label="Charge by" value={form.chargeBy} onChangeText={v=>setForm(f=>({ ...f, chargeBy: (v as any) }))} mode="outlined" />
            <View style={{ height:8 }} />
            <TextInput label="Rate" value={String(form.rate)} onChangeText={v=>setForm(f=>({ ...f, rate: Number(v)||0 }))} keyboardType="numeric" mode="outlined" />
            <View style={{ flexDirection:'row', marginTop:8 }}>
              <TextInput label="VAT (%)" value={String(form.vat)} onChangeText={v=>setForm(f=>({ ...f, vat: Number(v)||0 }))} keyboardType="numeric" mode="outlined" style={{ flex:1, marginRight:8 }} />
              <TextInput label="VAT included? (incl/excl)" value={form.includeVat? 'incl':'excl'} onChangeText={v=>setForm(f=>({ ...f, includeVat: v==='incl' }))} mode="outlined" style={{ flex:1 }} />
            </View>
            <View style={{ height:8 }} />
            <TextInput label="Model (single/tou)" value={form.model} onChangeText={v=>setForm(f=>({ ...f, model: (v as any) }))} mode="outlined" />
            <View style={{ flexDirection:'row', justifyContent:'flex-end', marginTop:8 }}>
              <Button onPress={()=>setEditorOpen(false)}>Cancel</Button>
              <Button mode="contained" buttonColor={theme.colors.secondary} textColor="#fff" onPress={saveTemplate} style={{ marginLeft:8 }}>Save template</Button>
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
  bottomNavCard:{ borderTopLeftRadius:16, borderTopRightRadius:16, overflow:'hidden' },
  blurCard:{ borderRadius:14, overflow:'hidden', borderWidth:1, borderColor:'rgba(255,255,255,0.55)' },
  blurInner:{ padding:12, backgroundColor: Platform.select({ ios:'rgba(255,255,255,0.2)', android:'rgba(255,255,255,0.35)' }) },
  badge:{ height:26, borderRadius:16 },
  badgeCommercial:{ backgroundColor:'#f77f00' },
  badgeDefault:{ backgroundColor:'rgba(0,0,0,0.08)' },
  footer:{ flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingBottom:12 + Number(Platform.select({ ios: 8, android: 0 })), paddingTop:12, backgroundColor:'#f2f2f2', borderTopWidth:StyleSheet.hairlineWidth, borderTopColor:'#e9eceb' },
});
