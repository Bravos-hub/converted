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
  Chip,
  IconButton,
  List,
  RadioButton,
} from 'react-native-paper';

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary:'#03cd8c', secondary:'#f77f00', background:'#f2f2f2', surface:'#ffffff' }, roundness:14 };

export type Reservation = { id:string; user:string; connector:string; date:string; start:string; end:string; status:'Pending'|'Approved'|'Denied'|'Completed'|string; paid:boolean };
export type BookingsReservationsProps = {
  chargers?: { id:string; name:string }[];
  defaultChargerId?: string;
  onBack?: ()=>void; onHelp?: ()=>void; onNavChange?: (v:number)=>void;
  onApprove?: (p:{ chargerId:string; reservation:Reservation })=>void;
  onDeny?: (p:{ chargerId:string; reservation:Reservation })=>void;
  onReschedule?: (p:{ chargerId:string; reservation:Reservation; start:string; end:string })=>void;
  onOpen?: (p:{ chargerId:string; reservation:Reservation })=>void;
  onOpenOnCalendar?: (p:{ chargerId:string; highlight:{ date:string } })=>void; // S45
  onExportReservations?: (payload:any)=>void;
  getPricingSnapshot?: (p:{ chargerId:string })=>Promise<any>;
  onCreateSession?: (p:{ chargerId:string; reservation:Reservation; pricingSnapshot:any })=>void;
  onOpenPricingForApproval?: (p:{ chargerId:string; reservation:Reservation })=>void;
};

function GlassCard({ children, style }:{ children: React.ReactNode; style?: any }){
  return (
    <View style={[styles.blurCard, style]}>
      <View style={styles.blurInner}>{children}</View>
    </View>
  );
}

function ResRow({ r, onApprove, onDeny, onReschedule, onOpen, onOpenCalendar }:{ r:Reservation; onApprove?:(r:Reservation)=>void; onDeny?:(r:Reservation)=>void; onReschedule?:(r:Reservation)=>void; onOpen?:(r:Reservation)=>void; onOpenCalendar?:(r:Reservation)=>void; }){
  return (
    <GlassCard>
      <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
        <View style={{ flex:1 }}>
          <Text variant="titleSmall" style={{ fontWeight:'700' }}>{r.user} — {r.connector}</Text>
          <Text variant="labelSmall" style={{ opacity:0.7 }}>{r.start} → {r.end}</Text>
          <View style={{ flexDirection:'row', flexWrap:'wrap', marginTop:4 }}>
            <Chip compact>{r.status}</Chip>
            {r.paid ? <Chip compact style={{ marginLeft:6 }}>Paid</Chip> : null}
          </View>
        </View>
        <View style={{ flexDirection:'row', alignItems:'center' }}>
          {r.status==='Pending' && <IconButton icon="check" onPress={()=>onApprove?.(r)} />}
          {r.status==='Pending' && <IconButton icon="close" onPress={()=>onDeny?.(r)} />}
          <IconButton icon="calendar-edit" onPress={()=>onReschedule?.(r)} />
        </View>
      </View>
      <Button compact onPress={()=>{ onOpen?.(r); onOpenCalendar?.(r); }}>Open</Button>
    </GlassCard>
  );
}

export default function BookingsReservations({
  chargers=[{id:'st1',name:'Home Charger'},{id:'st2',name:'Office Charger'}],
  defaultChargerId='st1',
  onBack, onHelp, onNavChange,
  onApprove, onDeny, onReschedule, onOpen,
  onOpenOnCalendar,
  onExportReservations,
  getPricingSnapshot,
  onCreateSession,
  onOpenPricingForApproval,
}: BookingsReservationsProps){
  const [navValue, setNavValue] = useState(1);
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [tab, setTab] = useState<'upcoming'|'past'>('upcoming');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Reservation|null>(null);
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  type ReservationBuckets = { upcoming: Reservation[]; past: Reservation[] };

  const initial = useMemo<Record<string, ReservationBuckets>>(
    () => ({
      st1: {
        upcoming: [
          { id:'r1', user:'Lydia', connector:'Connector 1', date:'2025-11-01', start:'2025-11-01 14:00', end:'15:30', status:'Pending', paid:false },
          { id:'r2', user:'Noah', connector:'Connector 2', date:'2025-11-02', start:'2025-11-02 09:00', end:'10:00', status:'Approved', paid:true }
        ],
        past: [
          { id:'r3', user:'Amara', connector:'Connector 1', date:'2025-10-10', start:'2025-10-10 10:00', end:'11:00', status:'Completed', paid:true }
        ]
      },
      st2: {
        upcoming: [{ id:'r4', user:'Ken', connector:'Connector 3', date:'2025-11-01', start:'2025-11-01 08:00', end:'09:00', status:'Pending', paid:false }],
        past: []
      }
    }),
    []
  );

  const list: Reservation[] = initial[chargerId]?.[tab] ?? [];

  const openReschedule = (r:Reservation) => { setEditing(r); setNewStart(r.start); setNewEnd(r.end); setDialogOpen(true); };
  const saveReschedule = () => { if (editing) { onReschedule?.({ chargerId, reservation: editing, start: newStart, end: newEnd }); } setDialogOpen(false); };

  const approve = async (r:Reservation) => {
    onApprove ? onApprove({ chargerId, reservation: r }) : null;
    if (getPricingSnapshot && onCreateSession){
      try { const snap = await getPricingSnapshot({ chargerId }); onCreateSession({ chargerId, reservation: r, pricingSnapshot: snap }); return; }
      catch(e){ /* fallthrough */ }
    }
    onOpenPricingForApproval?.({ chargerId, reservation: r });
  };

  const exportCSV = () => {
    const headers = ['id','user','connector','date','start','end','status','paid'];
    const rows = list.map(r => headers.map(h => (r as any)[h]));
    onExportReservations?.({ chargerId, tab, count: list.length, headers, rows });
  };

  const Footer = (
    <View style={styles.footer}>
      <Chip selected={tab==='upcoming'} onPress={()=>setTab('upcoming')} style={{ marginRight:6 }}>Upcoming</Chip>
      <Chip selected={tab==='past'} onPress={()=>setTab('past')}>Past</Chip>
      <Button mode="contained" buttonColor={theme.colors.secondary} textColor="#fff" icon="download" onPress={exportCSV} style={{ marginLeft:'auto' }}>Export</Button>
    </View>
  );

  return (
    <PaperProvider theme={theme}>
      <View style={styles.root}>
        <Appbar.Header mode="small" elevated>
          <Appbar.Action icon="arrow-left" onPress={() => (onBack ? onBack() : router.back())} />
          <Appbar.Content title="Bookings & reservations" titleStyle={{ fontWeight:'700' }} subtitle="approve • reschedule • monetize" />
          <Appbar.Action icon="help-circle-outline" onPress={onHelp} />
        </Appbar.Header>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Charger selector */}
          <GlassCard>
            <Text variant="labelLarge" style={{ fontWeight:'800', marginBottom: 6 }}>My chargers</Text>
            <TextInput mode="outlined" value={chargers.find(c=>c.id===chargerId)?.name} right={<TextInput.Icon icon="menu-down" />} onFocus={()=>{}} />
          </GlassCard>

          <View style={{ marginTop:12 }}>
            {list.map(r => (
              <View key={r.id} style={{ marginBottom: 10 }}>
                <ResRow r={r}
                  onOpen={(x)=> onOpen ? onOpen({ chargerId, reservation: x }) : null}
                  onOpenCalendar={(x)=> onOpenOnCalendar ? onOpenOnCalendar({ chargerId, highlight:{ date: x.date } }) : null}
                  onApprove={approve}
                  onDeny={(x)=> onDeny ? onDeny({ chargerId, reservation: x }) : null}
                  onReschedule={(x)=> openReschedule(x)}
                />
              </View>
            ))}
            {!list.length && (
              <GlassCard>
                <Text variant="labelSmall" style={{ textAlign:'center', opacity:0.7 }}>No {tab} reservations.</Text>
              </GlassCard>
            )}
          </View>
        </ScrollView>
        {/* Global tabs already rendered; removed nested BottomNavigation */}
        {Footer}
      </View>

      {/* Reschedule dialog */}
      <Modal visible={dialogOpen} onRequestClose={()=>setDialogOpen(false)}>
        <View style={{ flex:1, justifyContent:'center', padding:24, backgroundColor:'rgba(0,0,0,0.25)' }}>
          <GlassCard>
            <Text variant="titleMedium" style={{ fontWeight:'800' }}>Reschedule</Text>
            <View style={{ height:8 }} />
            <TextInput label="Start" value={newStart} onChangeText={setNewStart} mode="outlined" />
            <View style={{ height:8 }} />
            <TextInput label="End" value={newEnd} onChangeText={setNewEnd} mode="outlined" />
            <View style={{ flexDirection:'row', justifyContent:'flex-end', marginTop:8 }}>
              <Button onPress={()=>setDialogOpen(false)}>Cancel</Button>
              <Button mode="contained" buttonColor={theme.colors.secondary} textColor="#fff" onPress={saveReschedule} style={{ marginLeft:8 }}>Save</Button>
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
