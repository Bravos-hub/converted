import * as React from 'react';
import { router } from 'expo-router';
import { useMemo, useState, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Platform, KeyboardAvoidingView, Pressable } from 'react-native';
import { Provider as PaperProvider, MD3LightTheme as DefaultTheme, Appbar, Text, Button, Chip, IconButton, TextInput, RadioButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useColorTheme } from '../../../hooks/use-color-theme';

// Icon names map to MaterialCommunityIcons by default in react-native-paper
// If you use a custom icon set, configure it in your app entry.

// ---- Theme ----
// Derived at runtime via useColorTheme in the component below.

// ---- Types ----
export type CardModel = {
  id: string;
  brand: string;
  last4: string;
  exp: string;
  default?: boolean;
  verified?: boolean;
};

export type WalletModel = {
  balance: number;
  currency: string;
};

export type PaymentMethodsProps = {
  commercialChargerId?: string;
  selectedChargerId?: string;
  aggregatorUrl?: string;
  onOpenAggregator?: (url?: string) => void;
  onBack?: () => void;
  onHelp?: () => void;
  onNavChange?: (value: number) => void;
  onTopUp?: () => void;
  onWithdraw?: () => void;
  onAddCard?: () => void;
  onSetDefault?: (card: CardModel) => void;
  onVerifyCard?: (card: CardModel) => void;
  onRemoveCard?: (card: CardModel) => void;
  wallet?: WalletModel;
  cards?: CardModel[];
};

// ---- Shell ----
function MobileShell({
  title,
  tagline,
  onBack,
  onHelp,
  scrollRef,
  children,
}: {
  title: string;
  tagline?: string;
  onBack?: () => void;
  onHelp?: () => void;
  scrollRef?: React.RefObject<ScrollView | null>;
  children: React.ReactNode;
}) {
  const C = useColorTheme();
  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: C.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Appbar.Header mode="small" elevated style={{ backgroundColor: C.primary }}>
        <Appbar.Action icon="arrow-left" onPress={() => (onBack ? onBack() : router.back())} />
        <Appbar.Content title={title} titleStyle={{ fontWeight: '700' }} subtitle={tagline} />
        <Appbar.Action icon="help-circle-outline" onPress={onHelp} />
      </Appbar.Header>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentInset={{ bottom: 80 }}
        scrollIndicatorInsets={{ bottom: 80 }}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function CommercialBadge({ isCommercial }: { isCommercial?: boolean }) {
  const C = useColorTheme();
  return (
    <Chip
      compact
      selectedColor={isCommercial ? C.onSecondary : undefined}
      style={[styles.badge, { backgroundColor: isCommercial ? C.secondary : 'rgba(0,0,0,0.08)' }]}
      textStyle={isCommercial ? styles.chipTextLight : styles.chipTextDark}
    >
      {isCommercial ? 'Commercial Charger' : 'Not commercial'}
    </Chip>
  );
}

// ---- Glassy Card Row ----
function GlassCard({ children, style }: { children: React.ReactNode; style?: any }) {
  const C = useColorTheme();
  return (
    <BlurView intensity={Platform.OS === 'ios' ? 35 : 40} tint="light" style={[styles.blurCard, { borderColor: C.glassCardBorder }, style]}> 
      <View style={[styles.blurInner, { backgroundColor: C.glassCardBg }]}>{children}</View>
    </BlurView>
  );
}

function CardRow({ card, onSetDefault, onVerify, onRemove }: {
  card: CardModel;
  onSetDefault?: (c: CardModel) => void;
  onVerify?: (c: CardModel) => void;
  onRemove?: (c: CardModel) => void;
}) {
  const C = useColorTheme();
  return (
    <GlassCard>
      <View style={styles.cardCol}>
        {/* Top row: title + delete */}
        <View style={styles.cardTopRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text variant="titleSmall" numberOfLines={1} style={{ fontWeight: '700' }}>{`${card.brand} •••• ${card.last4}`}</Text>
            <Text variant="labelSmall" style={{ opacity: 0.7, marginTop: 2 }}>{`Exp ${card.exp}`}</Text>
          </View>
          <IconButton icon="delete-outline" iconColor={C.error} onPress={() => onRemove?.(card)} />
        </View>

        {/* Chips */}
        <View style={styles.labelsWrap}>
          {card.default ? (
            <Chip
              compact
              icon={(p) => <MaterialCommunityIcons name="star" size={14} color="#fff" />}
              style={[styles.tinyChip, { backgroundColor: C.secondary }]}
              textStyle={styles.chipTextLight}
            >
              Default
            </Chip>
          ) : null}
          {card.verified ? (
            <Chip
              compact
              icon={(p) => <MaterialCommunityIcons name="check-decagram" size={14} color="#fff" />}
              style={[styles.tinyChip, { backgroundColor: C.success }]}
              textStyle={styles.chipTextLight}
            >
              Verified
            </Chip>
          ) : (
            <Chip
              compact
              icon={(p) => <MaterialCommunityIcons name="alert-circle-outline" size={14} color="#11181C" />}
              style={[styles.tinyChip, { backgroundColor: '#E6E8EC' }]}
              textStyle={styles.chipTextDark}
            >
              Unverified
            </Chip>
          )}
        </View>

        {/* Actions under details */}
        {(!card.default || !card.verified) && (
          <View style={styles.actionsRowBelow}>
            {!card.default && (
              <Button
                mode="outlined"
                onPress={() => onSetDefault?.(card)}
                style={[styles.pillBtn, styles.smallPill, { borderColor: C.icon }]}
                contentStyle={styles.smallPillContent}
                textColor={C.text}
                labelStyle={styles.pillLabel}
              >
                Set default
              </Button>
            )}
            {!card.verified && (
              <Button
                mode="outlined"
                onPress={() => onVerify?.(card)}
                style={[styles.pillBtn, styles.smallPill, { borderColor: C.success }]}
                contentStyle={styles.smallPillContent}
                textColor={C.success}
                labelStyle={styles.pillLabel}
              >
                Verify
              </Button>
            )}
          </View>
        )}
      </View>
    </GlassCard>
  );
}

// ---- Main ----
export default function PaymentMethods({
  commercialChargerId,
  selectedChargerId,
  aggregatorUrl,
  onOpenAggregator,
  onBack,
  onHelp,
  onTopUp,
  onWithdraw,
  onAddCard,
  onSetDefault,
  onVerifyCard,
  onRemoveCard,
  wallet = { balance: 180000, currency: 'UGX' },
  cards: initialCards,
}: PaymentMethodsProps) {
  // Bottom navigation removed per request
  const C = useColorTheme();
  const scrollRef = useRef<ScrollView | null>(null);
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: C.primary,
      secondary: C.secondary,
      background: C.background,
      surface: 'rgba(255,255,255,0.7)'
    },
    roundness: 14,
    fonts: DefaultTheme.fonts,
  } as const;
  const [showAdd, setShowAdd] = useState(false);
  const [addNumber, setAddNumber] = useState('');
  const [addExp, setAddExp] = useState('');
  const [addCvv, setAddCvv] = useState('');
  const [addBrand, setAddBrand] = useState<'visa' | 'mc' | 'amex'>('visa');
  const [cards, setCards] = useState<CardModel[]>(
    initialCards || [
      { id: 'c1', brand: 'Visa', last4: '1234', exp: '10/27', default: true, verified: true },
      { id: 'c2', brand: 'Mastercard', last4: '5678', exp: '09/26', default: false, verified: false },
    ]
  );

  const isCommercial = !!(selectedChargerId && commercialChargerId && selectedChargerId === commercialChargerId);
  const totalVerified = useMemo(() => cards.filter((c) => c.verified).length, [cards]);

  // ---- Card actions (default handlers if no props provided) ----
  const setDefaultLocal = (card: CardModel) => {
    setCards((prev) => prev.map((c) => ({ ...c, default: c.id === card.id })));
  };
  const verifyLocal = (card: CardModel) => {
    setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, verified: true } : c)));
  };
  const removeLocal = (card: CardModel) => {
    setCards((prev) => prev.filter((c) => c.id !== card.id));
  };

  useEffect(() => {
    if (showAdd) setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, [showAdd]);

  // ---- Input formatters & validation ----
  const formatCardNumber = (raw: string, brand: 'visa' | 'mc' | 'amex') => {
    const digits = (raw || '').replace(/\D/g, '');
    const groups = brand === 'amex' ? [4, 6, 5] : [4, 4, 4, 4];
    const max = groups.reduce((a, b) => a + b, 0);
    let out: string[] = [];
    let idx = 0;
    for (const g of groups) {
      const chunk = digits.slice(idx, idx + g);
      if (!chunk) break;
      out.push(chunk);
      idx += g;
    }
    return out.join(' ');
  };

  const onChangeNumber = (v: string) => setAddNumber(formatCardNumber(v, addBrand));

  // Auto insert '/' after 2 digits; keep max length 5
  const onChangeExp = (v: string) => {
    const digits = (v || '').replace(/\D/g, '').slice(0, 4);
    const mm = digits.slice(0, 2);
    const yy = digits.slice(2, 4);
    setAddExp(yy ? `${mm}/${yy}` : mm);
  };

  const onChangeCvv = (v: string) => {
    const max = addBrand === 'amex' ? 4 : 3;
    const digits = (v || '').replace(/\D/g, '').slice(0, max);
    setAddCvv(digits);
  };

  // Reformat number when brand changes (Amex length differs)
  useEffect(() => {
    setAddNumber((prev) => formatCardNumber(prev, addBrand));
    setAddCvv((prev) => (addBrand === 'amex' ? prev.slice(0, 4) : prev.slice(0, 3)));
  }, [addBrand]);

  const digitsOnly = (s: string) => (s || '').replace(/\D/g, '');
  const isValidNumber = () => {
    const d = digitsOnly(addNumber);
    const len = addBrand === 'amex' ? 15 : 16;
    return d.length === len;
  };
  const isValidExp = () => /^(0[1-9]|1[0-2])\/\d{2}$/.test(addExp);
  const isValidCvv = () => {
    const max = addBrand === 'amex' ? 4 : 3;
    return digitsOnly(addCvv).length === max;
  };
  const canSave = isValidNumber() && isValidExp() && isValidCvv();

  return (
    <PaperProvider theme={theme}>
      <MobileShell
        title="Payment methods"
        tagline="wallet • cards • verification"
        onBack={onBack}
        onHelp={onHelp}
        scrollRef={scrollRef}
      >
        <View style={styles.section}>
          {/* Commercial badge + Aggregator CTA */}
          <View style={styles.rowStart}>
            <CommercialBadge isCommercial={isCommercial} />
            {!isCommercial ? (
              <Button mode="text" textColor={C.secondary} onPress={() => onOpenAggregator?.(aggregatorUrl)} style={{ marginLeft: 8 }}>
                Aggregator & CPMS
              </Button>
            ) : null}
          </View>

          {/* Wallet */}
          <GlassCard style={{ marginTop: 8 }}>
            <View style={[styles.rowStart, { alignItems: 'center' }]}>
              <IconButton icon="wallet" size={20} style={{ marginLeft: -6, marginRight: 2 }} />
              <View>
                <Text variant="titleSmall" style={{ fontWeight: '800' }}>Wallet</Text>
                <Text variant="bodySmall" style={{ opacity: 0.7 }}>Balance</Text>
              </View>
              <View style={{ marginLeft: 'auto', alignItems: 'flex-end' }}>
                <Text variant="titleMedium" style={{ fontWeight: '800' }}>{`${wallet.currency} ${wallet.balance.toLocaleString()}`}</Text>
                <Text variant="labelSmall" style={{ opacity: 0.7 }}>{`${totalVerified} verified card(s)`}</Text>
              </View>
            </View>
          </GlassCard>

          {/* Actions moved under wallet card */}
          <View style={styles.actionRow}>
            <Button mode="outlined" icon="wallet" onPress={() => onTopUp?.()} style={[styles.pillBtn, styles.actionBtn]}>Top up</Button>
            <Button mode="outlined" onPress={() => onWithdraw?.()} style={[styles.pillBtn, styles.actionBtn]}>Withdraw</Button>
            <Button mode="contained" buttonColor={C.secondary} textColor={C.onSecondary} icon="credit-card-plus-outline" onPress={() => { setShowAdd(true); onAddCard?.(); setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 0); }} style={[styles.pillBtn, styles.actionBtn]}>
              Add card
            </Button>
          </View>

          {/* Cards list */}
          <View style={{ marginTop: 16 }}>
            <Text variant="labelLarge" style={{ fontWeight: '800', marginBottom: 8 }}>Saved cards</Text>
            <View style={{ gap: 10 }}>
              {cards.map((c) => (
                <CardRow
                  key={c.id}
                  card={c}
                  onSetDefault={(card) => (onSetDefault ? onSetDefault(card) : setDefaultLocal(card))}
                  onVerify={(card) => (onVerifyCard ? onVerifyCard(card) : verifyLocal(card))}
                  onRemove={(card) => (onRemoveCard ? onRemoveCard(card) : removeLocal(card))}
                />
              ))}
            </View>
          </View>

          {/* Add card form (toggle by Add card button) */}
          {showAdd && (
          <GlassCard style={{ marginTop: 16, marginBottom: 16 }}>
            <Text variant="labelLarge" style={{ fontWeight: '800', marginBottom: 8 }}>Add a card</Text>
            <View style={{ gap: 10 }}>
              <TextInput label="Card number" placeholder="•••• •••• •••• ••••" keyboardType="number-pad" mode="outlined" style={styles.input} value={addNumber} onChangeText={onChangeNumber} onFocus={() => scrollRef.current?.scrollToEnd({ animated: true })} />
              <View style={styles.rowStart}>
                <TextInput label="Expiry (MM/YY)" placeholder="MM/YY" keyboardType="number-pad" mode="outlined" style={[styles.input, { flex: 1, marginRight: 10 }]} value={addExp} onChangeText={onChangeExp} />
                <TextInput label="CVV" placeholder={addBrand === 'amex' ? '••••' : '•••'} keyboardType="number-pad" mode="outlined" style={[styles.input, { width: 120 }]} value={addCvv} onChangeText={onChangeCvv} />
              </View>
              <RadioButton.Group onValueChange={(v) => setAddBrand(v as 'visa' | 'mc' | 'amex')} value={addBrand}>
                <View style={styles.brandRow}>
                  {(['visa','mc','amex'] as const).map((b) => (
                    <Pressable key={b} style={styles.brandCell} onPress={() => setAddBrand(b)}>
                      <RadioButton value={b} status={addBrand === b ? 'checked' : 'unchecked'} />
                      <Text style={styles.brandText}>{b === 'visa' ? 'Visa' : b === 'mc' ? 'Mastercard' : 'Amex'}</Text>
                    </Pressable>
                  ))}
                </View>
              </RadioButton.Group>
              <View style={[styles.rowStart, { justifyContent: 'flex-end' }]}>
                <Button mode="text" onPress={() => setShowAdd(false)} style={{ marginRight: 8 }}>Cancel</Button>
                <Button mode="contained" buttonColor={C.secondary} textColor={C.onSecondary} disabled={!canSave} onPress={() => {
                  const digits = (addNumber || '').replace(/\D/g, '');
                  const last4 = digits.slice(-4) || '0000';
                  const brandMap: Record<string, string> = { visa: 'Visa', mc: 'Mastercard', amex: 'Amex' };
                  const newCard: CardModel = {
                    id: Date.now().toString(),
                    brand: brandMap[addBrand] || 'Card',
                    last4,
                    exp: addExp || 'MM/YY',
                    default: false,
                    verified: false,
                  };
                  setCards((prev) => [...prev, newCard]);
                  onAddCard?.();
                  setShowAdd(false);
                  setAddNumber(''); setAddExp(''); setAddCvv(''); setAddBrand('visa');
                }} style={[styles.pillBtn]}>Save card</Button>
              </View>
            </View>
          </GlassCard>
          )}
        </View>
      </MobileShell>
    </PaperProvider>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f2f2f2' },
  content: { padding: 16 },
  section: { paddingBottom: 24 },
  rowStart: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 12 },
  pillBtn: { borderRadius: 999 },
  smallPill: { borderWidth: 1, paddingHorizontal: 10 },
  smallPillContent: { height: 32 },
  pillLabel: { fontSize: 12, fontWeight: '700' },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 72 },
  actionBtn: { flex: 1 },
  input: { borderRadius: 10 },
  labelsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  actionsWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  chipTextLight: { color: '#fff', fontWeight: '700' },
  chipTextDark: { color: '#11181C', fontWeight: '700' },
  actionsRowBelow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  cardCol: { flexDirection: 'column' },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  brandCell: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  brandText: { fontSize: 13 },
  badge: { height: 26, borderRadius: 16 },
  badgeCommercial: { backgroundColor: '#f77f00' },
  badgeDefault: { backgroundColor: 'rgba(0,0,0,0.08)' },
  tinyChip: { marginRight: 6, height: 28, paddingHorizontal: 10, borderRadius: 16 },
  successChip: { backgroundColor: 'rgba(16, 185, 129, 0.2)' },
  blurCard: { borderRadius: 14, overflow: 'hidden', borderWidth: 1 },
  blurInner: { padding: 12 },
});
