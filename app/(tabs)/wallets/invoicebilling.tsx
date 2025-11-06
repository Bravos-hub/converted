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
  IconButton,
  TextInput,
  List,
  Divider,
  SegmentedButtons,
} from 'react-native-paper';
import { BlurView } from 'expo-blur';

// ---- Theme ----
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#03cd8c',
    secondary: '#f77f00',
    background: '#f2f2f2',
    surface: 'rgba(255,255,255,0.7)'
  },
  roundness: 14,
  fonts: DefaultTheme.fonts,
};

// ---- Types ----
export type Invoice = {
  id: string;
  date: string; // YYYY-MM-DD
  site: string;
  amount: number;
  status: 'Paid' | 'Unpaid' | 'Refunded' | string;
  currency: string;
};

export type InvoicesBillingProps = {
  onBack?: () => void;
  onHelp?: () => void;
  onNavChange?: (value: number) => void;
  onOpenInvoice?: (invoice: Invoice) => void;
  onResendEmail?: (invoice: Invoice) => void;
  onResendWhatsApp?: (invoice: Invoice) => void;
  onDownloadPDF?: (invoice: Invoice) => void;
  onExportFiltered?: (params: { query: string; status: string; from: string; to: string; paidOnly: boolean; count: number }) => void;
  onPrepay?: (invoice: Invoice) => void;
  currency?: string;
};

// ---- Shell ----
function MobileShell({
  title,
  tagline,
  onBack,
  onHelp,
  navValue,
  onNavChange,
  footer,
  children,
}: {
  title: string;
  tagline?: string;
  onBack?: () => void;
  onHelp?: () => void;
  navValue: number;
  onNavChange?: (v: number) => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.root}>
      <Appbar.Header mode="small" elevated>
        <Appbar.Action icon="arrow-left" onPress={() => (onBack ? onBack() : router.back())} />
        <Appbar.Content title={title} titleStyle={{ fontWeight: '700' }} subtitle={tagline} />
        <Appbar.Action icon="bell-outline" onPress={onHelp} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
      <View style={styles.footerWrap}>{footer}</View>
    </View>
  );
}

// ---- Glassy Wrapper ----
function GlassCard({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <BlurView intensity={Platform.OS === 'ios' ? 35 : 50} tint="light" style={[styles.blurCard, style]}> 
      <View style={styles.blurInner}>{children}</View>
    </BlurView>
  );
}

// ---- Invoice Row ----
function InvoiceRow({ inv, onOpen, onResendEmail, onResendWhatsApp, onDownload, onPrepay }: {
  inv: Invoice;
  onOpen?: (i: Invoice) => void;
  onResendEmail?: (i: Invoice) => void;
  onResendWhatsApp?: (i: Invoice) => void;
  onDownload?: (i: Invoice) => void;
  onPrepay?: (i: Invoice) => void;
}) {
  const isUnpaid = inv.status === 'Unpaid';
  return (
    <GlassCard>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text variant="titleSmall" style={{ fontWeight: '700' }} onPress={() => onOpen?.(inv)}>
            {inv.id}
          </Text>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>{`${inv.date} • ${inv.site}`}</Text>
          <View style={styles.labelsWrap}>
            <Chip compact mode="flat" style={styles.tinyChip} selectedColor="#fff" icon={inv.status === 'Paid' ? 'check-decagram' : inv.status === 'Unpaid' ? 'alert' : 'information-outline'}>
              {inv.status}
            </Chip>
            <Chip compact mode="flat" style={styles.tinyChip}>{`${inv.currency} ${inv.amount.toLocaleString()}`}</Chip>
          </View>
        </View>
        <View style={styles.actionsWrap}>
          {isUnpaid && (
            <Button mode="contained" buttonColor={theme.colors.secondary} textColor="#fff" onPress={() => onPrepay?.(inv)}>
              Pre‑pay
            </Button>
          )}
          <IconButton icon="email-outline" onPress={() => onResendEmail?.(inv)} />
          <IconButton icon="whatsapp" onPress={() => onResendWhatsApp?.(inv)} />
          <IconButton icon="download" onPress={() => onDownload?.(inv)} />
        </View>
      </View>
    </GlassCard>
  );
}

// ---- Main ----
export default function InvoicesBilling({
  onBack,
  onHelp,
  onNavChange,
  onOpenInvoice,
  onResendEmail,
  onResendWhatsApp,
  onDownloadPDF,
  onExportFiltered,
  onPrepay,
  currency = 'UGX',
}: InvoicesBillingProps) {
  const [navValue, setNavValue] = useState(4);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'All' | 'Paid' | 'Unpaid' | 'Refunded'>('All');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [paidOnly, setPaidOnly] = useState(false);

  const invoices = useMemo<Invoice[]>(() => ([
    { id: 'INV-202510-001', date: '2025-10-18', site: 'Home Charger', amount: 14880, status: 'Paid', currency },
    { id: 'INV-202510-002', date: '2025-10-12', site: 'Office Charger', amount: 6120, status: 'Unpaid', currency },
    { id: 'INV-202509-010', date: '2025-09-28', site: 'Home Charger', amount: 14400, status: 'Paid', currency },
  ]), [currency]);

  const inRange = (d: string) => {
    if (!from && !to) return true;
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  };

  const filtered = invoices.filter((i) => (
    (paidOnly ? i.status === 'Paid' : (status === 'All' || i.status === status)) &&
    (query.trim() === '' || i.id.toLowerCase().includes(query.toLowerCase()) || i.site.toLowerCase().includes(query.toLowerCase())) &&
    inRange(i.date)
  ));

  const exportClick = () => onExportFiltered?.({ query, status, from, to, paidOnly, count: filtered.length });

  const Tip = (
    <GlassCard>
      <View style={styles.rowStart}>
        <View style={styles.tipDot} />
        <Text variant="labelSmall" style={{ flex: 1 }}>
          Tip: Use filters to quickly find and resend invoices. EVmart chargers complete compliance tests in advance to speed up pairing and reduce field issues.
        </Text>
      </View>
    </GlassCard>
  );

  const Controls = (
    <View style={{ gap: 10 }}>
      <View style={styles.rowStart}>
        <TextInput
          mode="outlined"
          placeholder="Search invoices"
          left={<TextInput.Icon icon="magnify" />}
          value={query}
          onChangeText={setQuery}
          style={{ flex: 1, marginRight: 8 }}
        />
        <SegmentedButtons
          value={status}
          onValueChange={(v) => setStatus(v as any)}
          buttons={[
            { value: 'All', label: 'All' },
            { value: 'Paid', label: 'Paid' },
            { value: 'Unpaid', label: 'Unpaid' },
            { value: 'Refunded', label: 'Refunded' },
          ]}
          density="small"
          style={{ flex: 1 }}
        />
      </View>
      <View style={styles.rowStart}>
        <TextInput mode="outlined" label="From" value={from} onChangeText={setFrom} right={<TextInput.Icon icon="calendar" />} style={{ flex: 1, marginRight: 8 }} />
        <TextInput mode="outlined" label="To" value={to} onChangeText={setTo} right={<TextInput.Icon icon="calendar" />} style={{ flex: 1 }} />
        <Button mode={paidOnly ? 'contained' : 'outlined'} onPress={() => setPaidOnly(!paidOnly)} style={{ marginLeft: 8 }}>
          {paidOnly ? 'Paid only ✓' : 'Paid only'}
        </Button>
      </View>
      <View style={styles.rowStart}>
        <Chip compact onPress={() => { const t = new Date(); const d = t.toISOString().slice(0,10); setFrom(d); setTo(d); }}>Today</Chip>
        <Chip compact onPress={() => { const t = new Date(); const toD = t.toISOString().slice(0,10); const fromD = new Date(t.getTime() - 6*86400000).toISOString().slice(0,10); setFrom(fromD); setTo(toD); }} style={{ marginLeft: 6 }}>Last 7</Chip>
        <Chip compact onPress={() => { const t = new Date(); const toD = t.toISOString().slice(0,10); const fromD = new Date(t.getTime() - 29*86400000).toISOString().slice(0,10); setFrom(fromD); setTo(toD); }} style={{ marginLeft: 6 }}>Last 30</Chip>
        <Button mode="contained" buttonColor={theme.colors.secondary} textColor="#fff" icon="download" onPress={exportClick} style={{ marginLeft: 'auto' }}>Export</Button>
      </View>
    </View>
  );

  return (
    <PaperProvider theme={theme}>
      <MobileShell
        title="Invoices & billing"
        tagline="search • filter • resend • download"
        onBack={onBack}
        onHelp={onHelp}
        navValue={navValue}
        onNavChange={(v) => { setNavValue(v); onNavChange?.(v); }}
        footer={null}
      >
        <View style={styles.section}> 
          {Tip}
          <View style={{ height: 8 }} />
          {Controls}
          <List.Section>
            {filtered.map((inv) => (
              <View key={inv.id} style={{ marginBottom: 10 }}>
                <InvoiceRow
                  inv={inv}
                  onOpen={(i) => onOpenInvoice?.(i)}
                  onResendEmail={(i) => onResendEmail?.(i)}
                  onResendWhatsApp={(i) => onResendWhatsApp?.(i)}
                  onDownload={(i) => onDownloadPDF?.(i)}
                  onPrepay={(i) => onPrepay?.(i)}
                />
              </View>
            ))}
          </List.Section>
          <Divider style={{ marginBottom: 120, opacity: 0 }} />
        </View>
      </MobileShell>
    </PaperProvider>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f2f2f2' },
  content: { padding: 16 },
  footerWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  
  section: { padding: 16, paddingBottom: 120, maxWidth: 480, alignSelf: 'center', width: '100%' },
  rowStart: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  labelsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  actionsWrap: { flexDirection: 'row', alignItems: 'center' },
  tinyChip: { marginRight: 6, height: 26 },
  blurCard: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.55)' },
  blurInner: { padding: 12, backgroundColor: Platform.select({ ios: 'rgba(255,255,255,0.2)', android: 'rgba(255,255,255,0.35)' }) },
  tipDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: theme.colors.secondary, marginRight: 8 },
});
