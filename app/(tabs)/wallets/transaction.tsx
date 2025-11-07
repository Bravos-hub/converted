// app/(tabs)/wallets/transaction.tsx
// Complete transaction history with filtering, summary, and detail rows

import * as React from 'react';
import { useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Provider as PaperProvider,
  Appbar,
  Card,
  Text,
  Chip,
  Searchbar,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorTheme } from '../../../hooks/use-color-theme';

// ===== Types =====
export type Transaction = {
  id: string;
  type: 'topup' | 'charge' | 'refund' | 'withdrawal';
  amount: number;
  currency: string;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  chargerName?: string;
  reference?: string;
};

export type Props = {
  transactions?: Transaction[];
  currency?: string;
  onViewTransaction?: (tx: Transaction) => void;
  onExport?: () => void;
  onBack?: () => void;
  onHelp?: () => void;
};

// ===== Glassy Card =====
function GlassCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const C = useColorTheme();

  return (
    <View
      style={[styles.blurCard, { borderColor: C.border }, style]}
    >
      <View style={styles.blurInner}>{children}</View>
    </View>
  );
}

// ===== Transaction Row =====
function TransactionRow({
  tx,
  onView,
}: {
  tx: Transaction;
  onView?: (tx: Transaction) => void;
}) {
  const C = useColorTheme();
  const icon =
    tx.type === 'topup'
      ? 'add-circle'
      : tx.type === 'charge'
        ? 'bolt'
        : tx.type === 'refund'
          ? 'refresh'
          : 'remove-circle';
  const iconColor =
    tx.type === 'topup' || tx.type === 'refund' ? C.success : C.error;
  const sign = tx.type === 'topup' || tx.type === 'refund' ? '+' : '-';
  const metaParts = [
    tx.date,
    tx.chargerName,
  ].filter(Boolean);

  return (
    <Card
      mode="outlined"
      style={[styles.txCard, { borderColor: C.border }]}
      onPress={() => onView?.(tx)}
    >
      <Card.Content>
        <View style={styles.rowBetween}>
          <View style={styles.rowCenter}>
            <View style={[styles.iconCircle, { backgroundColor: `${iconColor}22` }]}>
              <MaterialIcons name={icon} size={20} color={iconColor} />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text variant="titleSmall" style={styles.bold}>
                {tx.description}
              </Text>
              <Text variant="labelSmall" style={[styles.muted, { color: C.muted }]}>
                {metaParts.join(' • ')}
              </Text>
              {tx.reference ? (
                <Text
                  variant="labelSmall"
                  style={[styles.muted, { color: C.muted, fontSize: 10 }]}
                >
                  Ref: {tx.reference}
                </Text>
              ) : null}
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text variant="titleSmall" style={[styles.bold, { color: iconColor }]}>
              {sign}
              {tx.currency} {tx.amount.toLocaleString()}
            </Text>
            <Chip
              compact
              style={
                tx.status === 'completed'
                  ? { backgroundColor: C.successBg }
                  : tx.status === 'pending'
                    ? { backgroundColor: C.warningBg }
                    : { backgroundColor: C.errorBg }
              }
            >
              {tx.status}
            </Chip>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

// ===== Screen =====
export default function TransactionsScreen({
  transactions = [
    {
      id: '1',
      type: 'charge',
      amount: 14880,
      currency: 'UGX',
      description: 'Charging session',
      date: '2025-11-07 14:22',
      status: 'completed',
      chargerName: 'Home Charger',
      reference: 'TX-20251107-001',
    },
    {
      id: '2',
      type: 'topup',
      amount: 50000,
      currency: 'UGX',
      description: 'Wallet top-up',
      date: '2025-11-06 09:15',
      status: 'completed',
      reference: 'TX-20251106-002',
    },
    {
      id: '3',
      type: 'charge',
      amount: 8400,
      currency: 'UGX',
      description: 'Charging session',
      date: '2025-11-05 16:30',
      status: 'completed',
      chargerName: 'Office Charger',
      reference: 'TX-20251105-003',
    },
    {
      id: '4',
      type: 'refund',
      amount: 2000,
      currency: 'UGX',
      description: 'Session refund',
      date: '2025-11-04 11:20',
      status: 'completed',
      reference: 'TX-20251104-004',
    },
    {
      id: '5',
      type: 'topup',
      amount: 100000,
      currency: 'UGX',
      description: 'Wallet top-up',
      date: '2025-11-01 08:00',
      status: 'completed',
      reference: 'TX-20251101-005',
    },
  ],
  currency = 'UGX',
  onViewTransaction,
  onExport,
  onBack,
  onHelp,
}: Props) {
  const C = useColorTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<
    'all' | 'topup' | 'charge' | 'refund' | 'withdrawal'
  >('all');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'completed' | 'pending' | 'failed'
  >('all');

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const hasQuery = normalizedQuery.length > 0;

    return transactions.filter(tx => {
      const matchesSearch =
        !hasQuery ||
        tx.description.toLowerCase().includes(normalizedQuery) ||
        (tx.reference
          ? tx.reference.toLowerCase().includes(normalizedQuery)
          : false) ||
        (tx.chargerName
          ? tx.chargerName.toLowerCase().includes(normalizedQuery)
          : false);
      const matchesType = filterType === 'all' || tx.type === filterType;
      const matchesStatus =
        filterStatus === 'all' || tx.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [transactions, searchQuery, filterType, filterStatus]);

  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter(tx => tx.type === 'topup' || tx.type === 'refund')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expenses = filteredTransactions
      .filter(tx => tx.type === 'charge' || tx.type === 'withdrawal')
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { income, expenses, net: income - expenses };
  }, [filteredTransactions]);

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />

      {/* App Bar */}
      <Appbar.Header style={[styles.appbar, { backgroundColor: C.primary }]}>
        <Appbar.Action
          icon="arrow-left"
          onPress={() => (onBack ? onBack() : router.back())}
          color={C.onPrimary}
        />
        <Appbar.Content
          title="Transactions"
          subtitle="complete transaction history"
          titleStyle={[styles.appbarTitle, { color: C.onPrimary }]}
          color={C.onPrimary}
        />
        <Appbar.Action
          icon="download"
          onPress={onExport}
          color={C.onPrimary}
        />
        {onHelp ? (
          <Appbar.Action
            icon="help-circle-outline"
            onPress={onHelp}
            color={C.onPrimary}
          />
        ) : null}
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: C.surface }]}
      >
        {/* Search */}
        <Searchbar
          placeholder="Search by description or reference"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        {/* Filters */}
        <GlassCard>
          <Text variant="labelSmall" style={[styles.bold, { marginBottom: 8 }]}>
            Type
          </Text>
          <View style={styles.filterRow}>
            {(['all', 'topup', 'charge', 'refund', 'withdrawal'] as const).map(
              type => (
                <Chip
                  key={type}
                  selected={filterType === type}
                  onPress={() => setFilterType(type)}
                  style={styles.filterChip}
                >
                  {type === 'all'
                    ? 'All'
                    : type.charAt(0).toUpperCase() + type.slice(1)}
                </Chip>
              ),
            )}
          </View>

          <Text
            variant="labelSmall"
            style={[styles.bold, { marginTop: 8, marginBottom: 8 }]}
          >
            Status
          </Text>
          <View style={styles.filterRow}>
            {(['all', 'completed', 'pending', 'failed'] as const).map(status => (
              <Chip
                key={status}
                selected={filterStatus === status}
                onPress={() => setFilterStatus(status)}
                style={styles.filterChip}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Chip>
            ))}
          </View>
        </GlassCard>

        {/* Summary */}
        <GlassCard>
          <Text variant="titleSmall" style={[styles.bold, { marginBottom: 8 }]}>
            Summary
          </Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text variant="labelSmall" style={{ color: C.muted }}>
                Income
              </Text>
              <Text variant="titleMedium" style={[styles.bold, { color: C.success }]}>
                +{currency} {totals.income.toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text variant="labelSmall" style={{ color: C.muted }}>
                Expenses
              </Text>
              <Text variant="titleMedium" style={[styles.bold, { color: C.error }]}>
                -{currency} {totals.expenses.toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text variant="labelSmall" style={{ color: C.muted }}>
                Net
              </Text>
              <Text
                variant="titleMedium"
                style={[
                  styles.bold,
                  { color: totals.net >= 0 ? C.success : C.error },
                ]}
              >
                {totals.net >= 0 ? '+' : ''}
                {currency} {totals.net.toLocaleString()}
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Transaction List */}
        <Text variant="titleSmall" style={[styles.bold, { marginBottom: 8 }]}>
          {filteredTransactions.length} Transaction
          {filteredTransactions.length === 1 ? '' : 's'}
        </Text>

        {filteredTransactions.map(tx => (
          <TransactionRow key={tx.id} tx={tx} onView={onViewTransaction} />
        ))}

        {filteredTransactions.length === 0 ? (
          <GlassCard>
            <Text variant="bodySmall" style={{ textAlign: 'center', color: C.muted }}>
              No transactions found
            </Text>
          </GlassCard>
        ) : null}

        <View style={{ height: 32 }} />
      </ScrollView>
    </PaperProvider>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  appbar: {},
  appbarTitle: { fontWeight: '800' },
  container: { padding: 16, paddingBottom: 32 },
  searchbar: { marginBottom: 12, borderRadius: 12 },
  blurCard: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  blurInner: {
    padding: 12,
    backgroundColor: Platform.select({
      ios: '#ffffff',
      android: '#ffffff',
    }),
  },
  bold: { fontWeight: '800' },
  muted: {},
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  filterChip: { marginBottom: 6 },
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { flex: 1, alignItems: 'center' },
  txCard: { marginBottom: 8, borderRadius: 12 },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
