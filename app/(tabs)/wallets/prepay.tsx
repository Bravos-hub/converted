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
  RadioButton,
} from 'react-native-paper';

// ---- Theme ----
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#03cd8c',
    secondary: '#f77f00',
    background: '#f2f2f2',
    surface: '#ffffff'
  },
  roundness: 14,
  fonts: DefaultTheme.fonts,
};

// ---- Types ----
export type Quote = {
  site: string;
  connector: string;
  power: string; // e.g., "80 kW"
  energy: number; // kWh
  rate: number; // per kWh
  fees: number; // flat
  taxes: number; // fraction e.g., 0.18
};

export type PrePayOrderProps = {
  onBack?: () => void;
  onHelp?: () => void;
  onNavChange?: (value: number) => void;
  onConfirm?: (payload: { method: string; total: number; quote: Quote }) => void;
  onSelectMethod?: (value: string) => void;
  onOpenPaymentMethods?: (method: string) => void;
  estimate?: Quote;
  currency?: string;
  commercialChargerId?: string;
  selectedChargerId?: string;
  aggregatorUrl?: string;
  onOpenAggregator?: (url?: string) => void;
};

// ---- Shell ----
function MobileShell({
  title,
  tagline,
  onBack,
  onHelp,
  navValue,
  onNavChange,
  children,
}: {
  title: string;
  tagline?: string;
  onBack?: () => void;
  onHelp?: () => void;
  navValue: number;
  onNavChange?: (v: number) => void;
  children: React.ReactNode;
}) {
  const handleBack = () => {
    onBack?.();
    router.push('/(tabs)/wallet');
  };

  return (
    <View style={styles.root}>
      <Appbar.Header mode="small" elevated style={styles.appBar}>
        <Appbar.Action icon="arrow-left" onPress={handleBack} color="#fff" />
        <Appbar.Content
          title={title}
          titleStyle={{ fontWeight: '700', color: '#fff' }}
          subtitle={tagline}
          subtitleStyle={{ color: '#e8fff6' }}
        />
        <Appbar.Action icon="help-circle-outline" onPress={onHelp} color="#fff" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </View>
  );
}

// ---- Glassy Wrapper ----
function GlassCard({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[styles.blurCard, style]}> 
      <View style={styles.blurInner}>{children}</View>
    </View>
  );
}

function CommercialBadge({ isCommercial }: { isCommercial?: boolean }) {
  return (
    <Chip compact selectedColor="#fff" style={[styles.badge, isCommercial ? styles.badgeCommercial : styles.badgeDefault]}>
      {isCommercial ? 'Commercial Charger' : 'Not commercial'}
    </Chip>
  );
}

// ---- Main ----
export default function PrePayOrder({
  onBack,
  onHelp,
  onNavChange,
  onConfirm,
  onSelectMethod,
  onOpenPaymentMethods,
  estimate,
  currency = 'UGX',
  commercialChargerId,
  selectedChargerId,
  aggregatorUrl,
  onOpenAggregator,
}: PrePayOrderProps) {
  const [navValue, setNavValue] = useState(2);
  const [method, setMethod] = useState<'wallet' | 'card' | 'mobile'>('wallet');

  const quote = useMemo<Quote>(() => (
    estimate || { site: 'Home Charger', connector: 'CCS 2', power: '80 kW', energy: 12.4, rate: 1200, fees: 2000, taxes: 0.18 }
  ), [estimate]);

  const subtotal = quote.energy * quote.rate;
  const taxes = Math.round(subtotal * quote.taxes);
  const total = subtotal + taxes + quote.fees;

  const isCommercial = !!(selectedChargerId && commercialChargerId && selectedChargerId === commercialChargerId);
  const handleOpenPaymentMethods = () => {
    onOpenPaymentMethods?.(method);
    router.push('/(tabs)/wallets/paymentmethod');
  };

  return (
    <PaperProvider theme={theme}>
      <MobileShell
        title="Pre‑pay order"
        tagline="estimate • fees • payment"
        onBack={onBack}
        onHelp={onHelp}
        navValue={navValue}
        onNavChange={(v) => { setNavValue(v); onNavChange?.(v); }}
      >
        <View style={styles.section}> 
          {/* Commercial badge + Aggregator CTA */}
          <View style={styles.rowStart}>
            <CommercialBadge isCommercial={isCommercial} />
            {!isCommercial ? (
              <Button mode="text" onPress={() => onOpenAggregator?.(aggregatorUrl)} style={{ marginLeft: 8 }}>
                Aggregator & CPMS
              </Button>
            ) : null}
          </View>

          {/* Tip when not commercial */}
          {!isCommercial && (
            <GlassCard style={{ marginTop: 8 }}>
              <Text variant="labelSmall">
                Pre‑pay is for public sessions on your commercial charger. Make this charger commercial to enable public pre‑pay, or use EVzone Aggregator & CPMS for multiple commercial chargers.
              </Text>
            </GlassCard>
          )}

          {/* Order details */}
          <GlassCard style={{ marginTop: 12 }}>
            <Text variant="labelLarge" style={{ fontWeight: '800', marginBottom: 6 }}>Order details</Text>
            <View style={{ gap: 4 }}>
              <Text variant="bodySmall"><Text style={styles.strong}>Site:</Text> {quote.site}</Text>
              <Text variant="bodySmall"><Text style={styles.strong}>Connector:</Text> {quote.connector}</Text>
              <Text variant="bodySmall"><Text style={styles.strong}>Max power:</Text> {quote.power}</Text>
              <Text variant="bodySmall"><Text style={styles.strong}>Energy (est.):</Text> {quote.energy} kWh</Text>
              <Text variant="bodySmall"><Text style={styles.strong}>Rate:</Text> {currency} {quote.rate.toLocaleString()} / kWh</Text>
            </View>
            <View style={{ height: 8 }} />
            <View style={{ gap: 4 }}>
              <Text variant="bodySmall"><Text style={styles.strong}>Subtotal:</Text> {currency} {subtotal.toLocaleString()}</Text>
              <Text variant="bodySmall"><Text style={styles.strong}>Fees:</Text> {currency} {quote.fees.toLocaleString()}</Text>
              <Text variant="bodySmall"><Text style={styles.strong}>Taxes:</Text> {currency} {taxes.toLocaleString()}</Text>
              <Text variant="titleSmall" style={{ fontWeight: '800', marginTop: 4 }}><Text style={styles.strong}>Total:</Text> {currency} {total.toLocaleString()}</Text>
            </View>
          </GlassCard>

          {/* Payment method */}
          <GlassCard style={{ marginTop: 12, marginBottom: 12 }}>
            <Text variant="labelLarge" style={{ fontWeight: '800', marginBottom: 6 }}>Payment method</Text>
            <RadioButton.Group
              value={method}
              onValueChange={(v) => { setMethod(v as any); onSelectMethod?.(v); }}
            >
              <RadioButton.Item label="EVzone Pay (Wallet)" value="wallet" position="leading" />
              <RadioButton.Item label="Card" value="card" position="leading" />
              <RadioButton.Item label="Mobile money" value="mobile" position="leading" />
            </RadioButton.Group>
          </GlassCard>
          <View style={styles.footerActions}>
            <Button
              mode="outlined"
              icon="credit-card-outline"
              onPress={handleOpenPaymentMethods}
              style={styles.fullWidthButton}
            >
              Manage methods
            </Button>
            <Button
              mode="contained"
              buttonColor={theme.colors.secondary}
              textColor="#fff"
              icon="lock-outline"
              onPress={() => onConfirm?.({ method, total, quote })}
              style={styles.fullWidthButton}
            >
              Confirm & lock
            </Button>
          </View>
        </View>
      </MobileShell>
    </PaperProvider>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f2f2f2' },
  appBar: { backgroundColor: theme.colors.primary },
  content: { padding: 16 },
  
  section: { paddingBottom: 32 },
  rowStart: { flexDirection: 'row', alignItems: 'center' },
  footerActions: { paddingHorizontal: 16, paddingBottom: 12 + Number(Platform.select({ ios: 8, android: 0 })), paddingTop: 12, backgroundColor: '#f2f2f2', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e9eceb', gap: 8 },
  fullWidthButton: { width: '100%' },
  badge: { height: 26, borderRadius: 16 },
  badgeCommercial: { backgroundColor: '#f77f00' },
  badgeDefault: { backgroundColor: 'rgba(0,0,0,0.08)' },
  blurCard: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#ffffff' },
  blurInner: { padding: 12, backgroundColor: Platform.select({ ios: '#ffffff', android: '#ffffff' }) },
  strong: { fontWeight: '700' },
});
