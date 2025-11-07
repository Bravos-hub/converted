import { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Platform, Pressable } from 'react-native';
import { router } from 'expo-router';
import {
  Provider as PaperProvider,
  MD3LightTheme as DefaultTheme,
  Appbar,
  Text,
  Button,
  
  TextInput,
  Chip,
  IconButton,
} from 'react-native-paper';

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary:'#03cd8c', secondary:'#f77f00', background:'#f2f2f2', surface:'#ffffff' }, roundness:14 };

export type ScheduleCalendarsProps = {
  chargers?: { id:string; name:string }[];
  defaultChargerId?: string;
  onBack?: ()=>void; onHelp?: ()=>void; onNavChange?: (v:number)=>void;
  onNavigate?: (p:any)=>void; onOpenItem?: (p:any)=>void; onCreateSchedule?: (p:{ chargerId:string; date: Date })=>void;
  highlight?: { date?: string };
};

function GlassCard({ children, style }:{ children: React.ReactNode; style?: any }){
  return (
    <View style={[styles.blurCard, style]}>
      <View style={styles.blurInner}>{children}</View>
    </View>
  );
}

function MonthGrid({ year, month, items, onOpen, highlightDate }:{ year:number; month:number; items:Record<string, any[]>; onOpen:(it:any)=>void; highlightDate?: string }){
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const cells: { inMonth:boolean; dayNum:number; key:string; dayItems:any[] }[] = [];
  for (let i=0;i<42;i++){
    const dayNum = i - startDay + 1;
    const inMonth = dayNum>=1 && dayNum<=daysInMonth;
    const key = inMonth ? `${year}-${String(month+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}` : '';
    cells.push({ inMonth, dayNum, key, dayItems: inMonth ? (items[key]||[]) : [] });
  }
  return (
    <View style={styles.monthGrid}>
      {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
        <Text key={d} variant="labelSmall" style={{ textAlign:'center', opacity:0.7 }}>{d}</Text>
      ))}
      {cells.map((c, i)=> (
        <GlassCard key={i} style={[{ minHeight:64, padding:8, borderWidth:2, borderColor: c.key===highlightDate? '#f77f00':'#ffffff' }] }>
          <Text variant="labelSmall" style={{ opacity:0.7 }}>{c.inMonth? c.dayNum: ''}</Text>
          <View style={{ flexDirection:'row', flexWrap:'wrap', marginTop:2 }}>
            {c.dayItems.slice(0,2).map((it,idx)=> (
              <Chip key={idx} compact onPress={()=>onOpen(it)} style={{ marginRight:4, marginTop:2 }} selectedColor="#fff">{`${it.type==='schedule'?'Sch:':'Res:'} ${it.title}`}</Chip>
            ))}
            {c.dayItems.length>2 && <Text variant="labelSmall" style={{ opacity:0.7 }}>+{c.dayItems.length-2} more</Text>}
          </View>
        </GlassCard>
      ))}
    </View>
  );
}

function WeekList({ startDate, items, onOpen, highlightDate }:{ startDate: Date; items:Record<string, any[]>; onOpen:(it:any)=>void; highlightDate?:string }){
  const days = Array.from({ length: 7 }).map((_,i)=>{
    const d = new Date(startDate.getTime() + i*86400000);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return { label: d.toDateString().slice(0,10), key };
  });
  return (
    <View style={{ gap: 6 }}>
      {days.map(d => (
        <GlassCard key={d.key} style={{ borderWidth:2, borderColor: d.key===highlightDate? '#f77f00':'#ffffff' }}>
          <Text variant="titleSmall" style={{ fontWeight:'700' }}>{d.label}</Text>
          <View style={{ flexDirection:'row', flexWrap:'wrap', marginTop:4 }}>
            {(items[d.key]||[]).map((it,idx)=> (
              <Chip key={idx} compact onPress={()=>onOpen(it)} style={{ marginRight:4, marginTop:2 }} selectedColor="#fff">{`${it.time? it.time+' • ' : ''}${it.type==='schedule'?'Sch:':'Res:'} ${it.title}`}</Chip>
            ))}
          </View>
        </GlassCard>
      ))}
    </View>
  );
}

export default function ScheduleCalendars({
  chargers=[{id:'st1',name:'Home Charger'},{id:'st2',name:'Office Charger'}], defaultChargerId='st1',
  onBack, onHelp, onNavChange, onNavigate, onOpenItem, onCreateSchedule, highlight
}: ScheduleCalendarsProps){
  const [navValue, setNavValue] = useState(1);
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [mode, setMode] = useState<'month'|'week'>('month');
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const items = useMemo(()=>({
    '2025-11-01':[ { type:'schedule', title:'Night 22:00-06:00', time:'' }, { type:'reservation', title:'Lydia', time:'14:00' } ],
    '2025-11-02':[ { type:'reservation', title:'Noah', time:'09:00' } ]
  }), []);

  const changeMonth = (delta:number) => { const d = new Date(cursor.getFullYear(), cursor.getMonth()+delta, 1); setCursor(d); onNavigate?.({ chargerId, mode:'month', year:d.getFullYear(), month:d.getMonth()+1 }); };
  const changeWeek = (delta:number) => { const d = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()+delta*7); setCursor(d); onNavigate?.({ chargerId, mode:'week', start:d }); };

  const Footer = (
    <View style={styles.footer}>
      <Chip icon="calendar-month" selected={mode==='month'} onPress={()=>setMode('month')} style={{ marginRight:6 }}>Month</Chip>
      <Chip icon="view-week" selected={mode==='week'} onPress={()=>setMode('week')}>Week</Chip>
      <Button mode="contained" buttonColor={theme.colors.secondary} textColor="#fff" onPress={()=> onCreateSchedule?.({ chargerId, date: cursor })} style={{ marginLeft:'auto' }}>New schedule</Button>
    </View>
  );

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const weekStart = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - cursor.getDay());

  return (
    <PaperProvider theme={theme}>
      <View style={styles.root}>
        <Appbar.Header mode="small" elevated>
          <Appbar.Action icon="arrow-left" onPress={() => (onBack ? onBack() : router.back())} />
          <Appbar.Content title="Schedule calendars" titleStyle={{ fontWeight:'700' }} subtitle="overlap • month • week" />
          <Appbar.Action icon="help-circle-outline" onPress={onHelp} />
        </Appbar.Header>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Controls */}
          <GlassCard>
            <View style={{ flexDirection:'row', alignItems:'center' }}>
              <TextInput mode="outlined" value={chargers.find(c=>c.id===chargerId)?.name} style={{ flex:1, marginRight: 8 }} right={<TextInput.Icon icon="menu-down" />} onFocus={()=>{}} />
              <IconButton icon="chevron-left" onPress={()=> mode==='month'? changeMonth(-1): changeWeek(-1)} />
              <Text variant="labelLarge" style={{ fontWeight:'800', width: 90, textAlign:'center' }}>{year} • {month+1}</Text>
              <IconButton icon="chevron-right" onPress={()=> mode==='month'? changeMonth(1): changeWeek(1)} />
            </View>
          </GlassCard>

          {mode==='month' ? (
            <MonthGrid year={year} month={month} items={items} onOpen={(it)=> onOpenItem?.({ chargerId, item: it })} highlightDate={highlight?.date} />
          ) : (
            <WeekList startDate={weekStart} items={items} onOpen={(it)=> onOpenItem?.({ chargerId, item: it })} highlightDate={highlight?.date} />
          )}
        </ScrollView>
        {/* Tabs are global; no nested BottomNavigation */}
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
  monthGrid:{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:6 } as any,
  footer:{ flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingBottom:12 + Number(Platform.select({ ios: 8, android: 0 })), paddingTop:12, backgroundColor:'#f2f2f2', borderTopWidth:StyleSheet.hairlineWidth, borderTopColor:'#e9eceb' },
});
