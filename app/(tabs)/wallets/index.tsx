// app/(tabs)/wallet/index.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Main wallet dashboard with balance, quick actions, and recent transactions

import * as React from 'react';
import { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { Stack, router, type Href } from 'expo-router';
import {
  Provider as PaperProvider,
  Appbar,
  Button,
  Card,
  Text,
  Chip,
  Divider,
  FAB,
} from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorTheme } from '../../../hooks/use-color-theme';
import Svg, { Path } from 'react-native-svg';

// ===== Types =====
export type Transaction = {
  id: string;
  type: 'topup' | 'charge' | 'refund' | 'withdrawal';
  amount: number;
  currency: string;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
};

export type PaymentMethod = {
  id: string;
  type: 'card' | 'mobile_money' | 'bank';
  last4: string;
  brand?: string;
  isDefault: boolean;
};

export type Props = {
  balance?: number;
  currency?: string;
  pendingBalance?: number;
  transactions?: Transaction[];
  paymentMethods?: PaymentMethod[];
  spendingLimit?: number;
  onTopUp?: () => void;
  onWithdraw?: () => void;
  onViewTransaction?: (tx: Transaction) => void;
  onManagePaymentMethods?: () => void;
  onViewAllTransactions?: () => void;
  onBack?: () => void;
  onHelp?: () => void;
};

// ===== Mini Sparkline =====
function Sparkline({ data = [4, 6, 5, 7, 8, 6, 9] }: { data?: number[] }) {
  const W = 100, H = 36, P = 4;
  const C = useColorTheme();
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const step = (W - P * 2) / (data.length - 1);
  const x = (i: number) => P + i * step;
  const y = (v: number) => H - P - (v / max) * (H - P * 2);
  const points = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ');
  const area = `${points} L ${x(data.length - 1)} ${H - P} L ${x(0)} ${H - P} Z`;

  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Path d={area} fill={`${C.primary}33`} />
      <Path d={points} fill="none" stroke={C.primary} strokeWidth={2} />
    </Svg>
  );
}

// ===== Glassy Card =====
function GlassCard({ children, style }: { children: React.ReactNode; style?: any }) {
  const C = useColorTheme();
  return (
    <View style={[styles.blurCard, { borderColor: C.border }, style]}>
      <View style={styles.blurInner}>{children}</View>
    </View>
  );
}

// ===== Transaction Row =====
function TransactionRow({ tx, onView }: { tx: Transaction; onView?: (tx: Transaction) => void }) {
  const C = useColorTheme();
  const icon = tx.type === 'topup' ? 'add-circle' : tx.type === 'charge' ? 'bolt' : tx.type === 'refund' ? 'refresh' : 'remove-circle';
  const iconColor = tx.type === 'topup' || tx.type === 'refund' ? C.success : C.error;
  const sign = tx.type === 'topup' || tx.type === 'refund' ? '+' : '-';

  return (
    <Card mode="outlined" style={[styles.txCard, { borderColor: C.border }]} onPress={() => onView?.(tx)}>
      <Card.Content style={styles.rowBetween}>
        <View style={styles.rowCenter}>
          <View style={[styles.iconCircle, { backgroundColor: `${iconColor}22` }]}>
            <MaterialIcons name={icon} size={20} color={iconColor} />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text variant="titleSmall" style={styles.bold}>{tx.description}</Text>
            <Text variant="labelSmall" style={[styles.muted, { color: C.muted }]}>{tx.date}</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="titleSmall" style={[styles.bold, { color: iconColor }]}>
            {sign}{tx.currency} {tx.amount.toLocaleString()}
          </Text>
          <Chip compact style={tx.status === 'completed' ? { backgroundColor: C.successBg } : tx.status === 'pending' ? { backgroundColor: C.warningBg } : { backgroundColor: C.errorBg }}>
            {tx.status}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );
}

// ===== Screen =====
export default function WalletScreen({
  balance = 180000,
  currency = 'UGX',
  pendingBalance = 12000,
  transactions = [
    { id: '1', type: 'charge', amount: 14880, currency: 'UGX', description: 'Charging session', date: '2025-11-07 14:22', status: 'completed' },
    { id: '2', type: 'topup', amount: 50000, currency: 'UGX', description: 'Wallet top-up', date: '2025-11-06 09:15', status: 'completed' },
    { id: '3', type: 'charge', amount: 8400, currency: 'UGX', description: 'Charging session', date: '2025-11-05 16:30', status: 'completed' },
  ],
  paymentMethods = [
    { id: '1', type: 'card', last4: '4242', brand: 'Visa', isDefault: true },
    { id: '2', type: 'mobile_money', last4: '1234', isDefault: false },
  ],
  spendingLimit = 100000,
  onTopUp,
  onWithdraw,
  onViewTransaction,
  onManagePaymentMethods,
  onViewAllTransactions,
  onBack,
  onHelp,
}: Props) {
  const C = useColorTheme();
  const [fabOpen, setFabOpen] = useState(false);
  const pushHiddenRoute = (href: string) => router.push(href as Href);

  // Calculate spending this week
  const weekSpending = useMemo(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return transactions
      .filter(tx => tx.type === 'charge' && new Date(tx.date) > weekAgo)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const spendingData = [12, 8, 15, 10, 14, 9, 18]; // Mock data for sparkline

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />

      {/* App Bar */}
      <Appbar.Header style={[styles.appbar, { backgroundColor: C.primary }]}>
        <Appbar.Content 
          title="Wallet" 
          subtitle="balance • transactions • payments" 
          titleStyle={[styles.appbarTitle, { color: C.onPrimary }]}
          color={C.onPrimary}
        />
        <Appbar.Action icon="help-outline" onPress={onHelp} color={C.onPrimary} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: C.surface }]}>
        {/* Balance Card */}
        <GlassCard style={{ marginBottom: 12 }}>
          <View style={styles.rowBetween}>
            <View>
              <Text variant="labelSmall" style={[styles.muted, { color: C.muted }]}>Available Balance</Text>
              <Text variant="headlineMedium" style={[styles.bold, { color: C.text }]}>
                {currency} {balance.toLocaleString()}
              </Text>
              {pendingBalance > 0 && (
                <Text variant="labelSmall" style={[styles.muted, { color: C.muted, marginTop: 4 }]}>
                  Pending: {currency} {pendingBalance.toLocaleString()}
                </Text>
              )}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <MaterialCommunityIcons name="wallet" size={32} color={C.primary} />
              <Sparkline data={spendingData} />
            </View>
          </View>

          <Divider style={{ marginVertical: 12 }} />

          <View style={styles.rowGap}>
            <Button 
              mode="contained" 
              buttonColor={C.secondary} 
              textColor={C.onSecondary}
              icon="plus"
              onPress={() =>
                onTopUp ? onTopUp() : pushHiddenRoute('/(tabs)/wallets/topup')
              }
              style={styles.actionBtn}
            >
              Top Up
            </Button>
            <Button 
              mode="outlined" 
              icon="bank-transfer-out"
              onPress={() =>
                onWithdraw ? onWithdraw() : router.push('/(tabs)/wallet')
              }
              style={styles.actionBtn}
            >
              Withdraw
            </Button>
          </View>
        </GlassCard>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <GlassCard style={styles.statCard}>
            <MaterialIcons name="trending-down" size={20} color={C.error} />
            <Text variant="labelSmall" style={[styles.muted, { color: C.muted, marginTop: 4 }]}>This Week</Text>
            <Text variant="titleMedium" style={[styles.bold, { color: C.text }]}>
              {currency} {weekSpending.toLocaleString()}
            </Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <MaterialIcons name="credit-card" size={20} color={C.primary} />
            <Text variant="labelSmall" style={[styles.muted, { color: C.muted, marginTop: 4 }]}>Payment Methods</Text>
            <Text variant="titleMedium" style={[styles.bold, { color: C.text }]}>
              {paymentMethods.length}
            </Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <MaterialIcons name="speed" size={20} color={C.warning} />
            <Text variant="labelSmall" style={[styles.muted, { color: C.muted, marginTop: 4 }]}>Spending Limit</Text>
            <Text variant="titleMedium" style={[styles.bold, { color: C.text }]}>
              {currency} {spendingLimit.toLocaleString()}
            </Text>
          </GlassCard>
        </View>

        {/* Payment Methods */}
        <GlassCard>
          <View style={styles.rowBetween}>
            <Text variant="titleSmall" style={styles.bold}>Payment Methods</Text>
            <Button 
              compact 
              mode="text"
              onPress={() =>
                onManagePaymentMethods
                  ? onManagePaymentMethods()
                  : pushHiddenRoute('/(tabs)/wallets/paymentmethod')
              }
            >
              Manage
            </Button>
          </View>
          <View style={styles.paymentMethodsRow}>
            {paymentMethods.slice(0, 3).map(pm => (
              <Chip 
                key={pm.id} 
                icon={pm.type === 'card' ? 'credit-card' : pm.type === 'mobile_money' ? 'cellphone' : 'bank'}
                style={{ marginRight: 6, marginBottom: 6 }}
              >
                {pm.brand || pm.type} •••• {pm.last4}
              </Chip>
            ))}
          </View>
        </GlassCard>

        {/* Recent Transactions */}
        <View style={styles.rowBetween}>
          <Text variant="titleSmall" style={styles.bold}>Recent Transactions</Text>
          <Button 
            compact 
            mode="text"
            onPress={() =>
              onViewAllTransactions
                ? onViewAllTransactions()
                : pushHiddenRoute('/(tabs)/wallets/transaction')
            }
          >
            View All
          </Button>
        </View>

        {transactions.slice(0, 5).map(tx => (
          <TransactionRow key={tx.id} tx={tx} onView={onViewTransaction} />
        ))}

        {transactions.length === 0 && (
          <GlassCard>
            <Text variant="bodySmall" style={{ textAlign: 'center', color: C.muted }}>
              No transactions yet
            </Text>
          </GlassCard>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB for quick actions */}
      <FAB.Group
        open={fabOpen}
        visible
        icon={fabOpen ? 'close' : 'plus'}
        actions={[
          {
            icon: 'bank-transfer-in',
            label: 'Top Up',
            onPress: () =>
              onTopUp ? onTopUp() : pushHiddenRoute('/(tabs)/wallets/topup'),
          },
          {
            icon: 'receipt',
            label: 'Invoices',
            onPress: () => pushHiddenRoute('/(tabs)/wallets/invoicebilling'),
          },
          {
            icon: 'history',
            label: 'Transactions',
            onPress: () =>
              onViewAllTransactions
                ? onViewAllTransactions()
                : pushHiddenRoute('/(tabs)/wallets/transaction'),
          },
        ]}
        onStateChange={({ open }) => setFabOpen(open)}
        fabStyle={{ backgroundColor: C.secondary }}
      />
    </PaperProvider>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  appbar: {},
  appbarTitle: { fontWeight: '800' },
  container: { padding: 16, paddingBottom: 32 },
  blurCard: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  blurInner: { 
    padding: 12, 
    backgroundColor: Platform.select({ 
      ios: '#ffffff', 
      android: '#ffffff' 
    }) 
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bold: { fontWeight: '800' },
  muted: {},
  actionBtn: { borderRadius: 999, flex: 1 },
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statCard: { flex: 1, alignItems: 'center' },
  paymentMethodsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  txCard: { marginBottom: 8, borderRadius: 12 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
