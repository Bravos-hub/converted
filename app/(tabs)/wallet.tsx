import * as React from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Provider as PaperProvider,
  Appbar,
  Text,
  Button,
  Chip,
  List,
  Divider,
  Snackbar,
  Portal,
  Dialog,
  TextInput,
  IconButton,
} from 'react-native-paper';
import { useColorTheme } from '../../hooks/use-color-theme';
import {
  walletSummary,
  walletTransactions,
  walletInvoices,
  walletCards,
} from '../../constants/mock-data';

type Flow = 'topup' | 'withdraw' | null;

function currency(amount: number) {
  return `UGX ${amount.toLocaleString()}`;
}

export default function WalletScreen() {
  const C = useColorTheme();
  const [snack, setSnack] = useState<string | null>(null);
  const [flow, setFlow] = useState<Flow>(null);
  const [amount, setAmount] = useState('');

  const submitFlow = () => {
    if (!amount) {
      setSnack('Enter amount');
      return;
    }
    setSnack(`${flow === 'topup' ? 'Top-up' : 'Withdrawal'} of UGX ${Number(amount).toLocaleString()} scheduled`);
    setFlow(null);
    setAmount('');
  };

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <Appbar.Header style={{ backgroundColor: C.primary }}>
        <Appbar.Content title="Wallet" titleStyle={styles.bold} subtitle="Balance • payouts • invoices" />
        <Appbar.Action icon="history" onPress={() => setSnack('Settlements synced')} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={{ color: C.muted }}>Balance</Text>
              <Text style={[styles.bold, styles.balance]}>{currency(walletSummary.balance)}</Text>
            </View>
            <Chip icon="clock-outline">Payout ETA {walletSummary.payoutEta}</Chip>
          </View>
          <View style={styles.rowGap}>
            <Chip icon="shield-lock" mode="outlined">
              Reserved {currency(walletSummary.reserved)}
            </Chip>
            <Chip icon="cash-plus" mode="outlined">
              Available {currency(walletSummary.balance - walletSummary.reserved)}
            </Chip>
          </View>
          <View style={styles.rowGap}>
            <Button mode="contained" icon="plus" onPress={() => setFlow('topup')} style={styles.flexBtn}>
              Top up
            </Button>
            <Button mode="outlined" icon="bank-transfer" onPress={() => setFlow('withdraw')} style={styles.flexBtn}>
              Withdraw
            </Button>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={[styles.bold, styles.cardTitle]}>Transactions</Text>
            <Button mode="text" onPress={() => setSnack('Export queued')} icon="download">
              Export
            </Button>
          </View>
          {walletTransactions.map((tx) => (
            <List.Item
              key={tx.id}
              title={tx.description}
              description={tx.timestamp}
              left={(props) => <List.Icon {...props} icon={tx.type === 'credit' ? 'arrow-bottom-left' : 'arrow-top-right'} />}
              right={() => <Text style={[styles.bold, { color: tx.type === 'credit' ? C.success : C.error }]}>{`${tx.type === 'credit' ? '+' : '-'}${tx.amount.toLocaleString()}`}</Text>}
            />
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={[styles.bold, styles.cardTitle]}>Payment methods</Text>
            <Button mode="text" onPress={() => router.push('/(tabs)/wallets/paymentmethod')} icon="chevron-right">
              Manage
            </Button>
          </View>
          {walletCards.map((card) => (
            <View key={card.id} style={styles.cardRow}>
              <View>
                <Text style={styles.bold}>{card.brand} •••• {card.last4}</Text>
                <Text style={{ color: C.muted }}>Exp {card.exp}</Text>
              </View>
              <View style={styles.rowGap}>
                {card.default && <Chip compact icon="star" style={styles.successChip}>Default</Chip>}
                <Chip compact icon={card.verified ? 'check-decagram' : 'alert'} style={card.verified ? styles.successChip : styles.warningChip}>
                  {card.verified ? 'Verified' : 'Verify'}
                </Chip>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={[styles.bold, styles.cardTitle]}>Invoices</Text>
          {walletInvoices.map((invoice) => (
            <List.Item
              key={invoice.id}
              title={`${invoice.period} • ${currency(invoice.amount)}`}
              description={invoice.id}
              right={() => (
                <Chip mode="outlined" icon={invoice.status === 'paid' ? 'check' : 'clock'}>
                  {invoice.status}
                </Chip>
              )}
              onPress={() => router.push('/(tabs)/wallets/invoicebilling')}
            />
          ))}
        </View>

        <View style={styles.card}>
          <Text style={[styles.bold, styles.cardTitle]}>Documents & invoices</Text>
          <Button mode="outlined" icon="file-pdf-box" onPress={() => setSnack('Invoice PDF emailed')}>
            Send latest PDF
          </Button>
          <Divider style={{ marginVertical: 12 }} />
          <Button mode="text" icon="wallet-plus" onPress={() => router.push('/(tabs)/wallets/prepay')}>
            Configure pre-pay
          </Button>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Portal>
        <Dialog visible={flow !== null} onDismiss={() => setFlow(null)}>
          <Dialog.Title>{flow === 'topup' ? 'Top up wallet' : 'Withdraw funds'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              label="Amount (UGX)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              left={<TextInput.Icon icon="currency-ugx" />}
            />
            <View style={styles.rowGap}>
              <Chip icon="bank">Stanbic ****2210</Chip>
              <IconButton icon="swap-horizontal" onPress={() => setSnack('Switch payout account')} />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setFlow(null)}>Cancel</Button>
            <Button onPress={submitFlow}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={1800}>
        {snack}
      </Snackbar>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eef3f1',
  },
  balance: { fontSize: 28, marginTop: 6 },
  bold: { fontWeight: '800' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  flexBtn: { flex: 1 },
  cardTitle: { fontSize: 16 },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#f0f0f0',
  },
  successChip: { backgroundColor: '#DCFCE7' },
  warningChip: { backgroundColor: '#fee2e2' },
});
