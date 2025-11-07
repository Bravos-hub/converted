// app/(tabs)/wallet/topup.tsx
// Wallet top-up screen with amount selection and payment method

import * as React from 'react';
import { useState } from 'react';
import { View, ScrollView, StyleSheet, Platform, Pressable } from 'react-native';
import { Stack, router, type Href } from 'expo-router';
import {
  Provider as PaperProvider,
  Appbar,
  Button,
  Card,
  Text,
  TextInput,
  RadioButton,
  Chip,
  Snackbar,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorTheme } from '../../../hooks/use-color-theme';

// ===== Types =====
export type PaymentMethod = {
  id: string;
  type: 'card' | 'mobile_money' | 'bank';
  last4: string;
  brand?: string;
  icon: string;
};

export type Props = {
  currency?: string;
  minAmount?: number;
  maxAmount?: number;
  suggestedAmounts?: number[];
  paymentMethods?: PaymentMethod[];
  onConfirm?: (payload: { amount: number; methodId: string }) => void;
  onAddPaymentMethod?: () => void;
  onBack?: () => void;
  onHelp?: () => void;
};

// ===== Glassy Card =====
function GlassCard({ children, style }: { children: React.ReactNode; style?: any }) {
  const C = useColorTheme();
  return (
    <View style={[styles.blurCard, { borderColor: C.border }, style]}>
      <View style={styles.blurInner}>{children}</View>
    </View>
  );
}

// ===== Screen =====
export default function TopUpScreen({
  currency = 'UGX',
  minAmount = 5000,
  maxAmount = 1000000,
  suggestedAmounts = [10000, 25000, 50000, 100000, 200000, 500000],
  paymentMethods = [
    { id: '1', type: 'card', last4: '4242', brand: 'Visa', icon: 'credit-card' },
    { id: '2', type: 'mobile_money', last4: '1234', brand: 'MTN', icon: 'cellphone' },
    { id: '3', type: 'bank', last4: '5678', brand: 'Bank', icon: 'bank' },
  ],
  onConfirm,
  onAddPaymentMethod,
  onBack,
  onHelp,
}: Props) {
  const C = useColorTheme();
  const [amount, setAmount] = useState('');
  const [selectedMethodId, setSelectedMethodId] = useState(paymentMethods[0]?.id || '');
  const [snack, setSnack] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  const numericAmount = parseFloat(amount) || 0;
  const isValid = numericAmount >= minAmount && numericAmount <= maxAmount && selectedMethodId;

  const handleConfirm = () => {
    if (!isValid) {
      setSnackMessage(`Amount must be between ${currency} ${minAmount.toLocaleString()} and ${currency} ${maxAmount.toLocaleString()}`);
      setSnack(true);
      return;
    }

    if (onConfirm) {
      onConfirm({ amount: numericAmount, methodId: selectedMethodId });
    } else {
      setSnackMessage('Top-up successful!');
      setSnack(true);
      setTimeout(() => router.back(), 1500);
    }
  };

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />

      {/* App Bar */}
      <Appbar.Header style={[styles.appbar, { backgroundColor: C.primary }]}>
        <Appbar.Action 
          icon="arrow-left" 
          onPress={() => onBack ? onBack() : router.back()} 
          color={C.onPrimary}
        />
        <Appbar.Content 
          title="Top Up Wallet" 
          subtitle="add funds to your wallet" 
          titleStyle={[styles.appbarTitle, { color: C.onPrimary }]}
          color={C.onPrimary}
        />
        <Appbar.Action icon="help-outline" onPress={onHelp} color={C.onPrimary} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: C.surface }]}>
        {/* Amount Input */}
        <GlassCard>
          <Text variant="titleSmall" style={styles.bold}>Enter Amount</Text>
          <TextInput
            label={`Amount (${currency})`}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Affix text={currency} />}
          />
          <Text variant="labelSmall" style={[styles.muted, { color: C.muted }]}>
            Min: {currency} {minAmount.toLocaleString()} • Max: {currency} {maxAmount.toLocaleString()}
          </Text>
        </GlassCard>

        {/* Suggested Amounts */}
        <GlassCard>
          <Text variant="titleSmall" style={[styles.bold, { marginBottom: 8 }]}>Quick Amounts</Text>
          <View style={styles.chipsGrid}>
            {suggestedAmounts.map((amt) => (
              <Chip
                key={amt}
                selected={numericAmount === amt}
                onPress={() => setAmount(amt.toString())}
                style={styles.amountChip}
              >
                {currency} {amt.toLocaleString()}
              </Chip>
            ))}
          </View>
        </GlassCard>

        {/* Payment Method Selection */}
        <GlassCard>
          <View style={styles.rowBetween}>
            <Text variant="titleSmall" style={styles.bold}>Payment Method</Text>
            <Button 
              compact 
              mode="text"
              onPress={() =>
                onAddPaymentMethod
                  ? onAddPaymentMethod()
                  : router.push('/(tabs)/wallets/paymentmethod' as Href)
              }
            >
              Add New
            </Button>
          </View>

          <RadioButton.Group value={selectedMethodId} onValueChange={setSelectedMethodId}>
            {paymentMethods.map((method) => (
              <Pressable 
                key={method.id} 
                onPress={() => setSelectedMethodId(method.id)}
                style={{ marginBottom: 8 }}
              >
                <Card 
                  mode="outlined" 
                  style={[
                    styles.methodCard, 
                    { borderColor: selectedMethodId === method.id ? C.secondary : C.border }
                  ]}
                >
                  <Card.Content style={styles.rowCenter}>
                    <RadioButton value={method.id} />
                    <MaterialIcons 
                      name={method.icon as any} 
                      size={24} 
                      color={C.text} 
                      style={{ marginLeft: 8, marginRight: 12 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text variant="titleSmall" style={styles.bold}>
                        {method.brand || method.type}
                      </Text>
                      <Text variant="labelSmall" style={[styles.muted, { color: C.muted }]}>
                        •••• {method.last4}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              </Pressable>
            ))}
          </RadioButton.Group>
        </GlassCard>

        {/* Summary */}
        {numericAmount > 0 && (
          <GlassCard>
            <Text variant="titleSmall" style={styles.bold}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text variant="bodySmall" style={{ color: C.muted }}>Amount</Text>
              <Text variant="bodySmall" style={styles.bold}>
                {currency} {numericAmount.toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="bodySmall" style={{ color: C.muted }}>Processing Fee</Text>
              <Text variant="bodySmall" style={styles.bold}>{currency} 0</Text>
            </View>
            <View style={[styles.summaryRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border }]}>
              <Text variant="titleSmall" style={styles.bold}>Total</Text>
              <Text variant="titleSmall" style={[styles.bold, { color: C.primary }]}>
                {currency} {numericAmount.toLocaleString()}
              </Text>
            </View>
          </GlassCard>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.footer, { backgroundColor: C.surface, borderTopColor: C.border }]}>
        <Button
          mode="contained"
          buttonColor={C.secondary}
          textColor={C.onSecondary}
          onPress={handleConfirm}
          disabled={!isValid}
          style={styles.confirmBtn}
          icon="check"
        >
          Confirm Top Up
        </Button>
      </View>

      <Snackbar 
        visible={snack} 
        onDismiss={() => setSnack(false)} 
        duration={2000}
      >
        {snackMessage}
      </Snackbar>
    </PaperProvider>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  appbar: {},
  appbarTitle: { fontWeight: '800' },
  container: { padding: 16, paddingBottom: 100 },
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
      android: '#ffffff' 
    }) 
  },
  bold: { fontWeight: '800' },
  muted: {},
  input: { marginVertical: 8 },
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amountChip: { marginBottom: 6 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  methodCard: { borderRadius: 12 },
  summaryRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginVertical: 4 
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  confirmBtn: { borderRadius: 999 },
});
