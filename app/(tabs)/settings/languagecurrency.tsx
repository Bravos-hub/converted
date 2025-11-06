import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import * as React from 'react';
import { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import {
    Appbar,
    Button,
    MD3LightTheme as DefaultTheme,
    Provider as PaperProvider,
    Switch,
    Text,
    TextInput,
} from 'react-native-paper';
import { useColorTheme } from '../../../hooks/use-color-theme';

function formatPreview(locale?:string, currency?:string){
  try{
    const amount = 14880.25;
    const now = new Date('2025-11-01T14:35:00Z');
    const money = new Intl.NumberFormat(locale||undefined, { style:'currency', currency: currency||'UGX' }).format(amount);
    const date = new Intl.DateTimeFormat(locale||undefined, { dateStyle:'medium', timeStyle:'short' }).format(now);
    const number = new Intl.NumberFormat(locale||undefined).format(10000.5);
    return { money, date, number };
  }catch(e){ return { money: `${currency||'UGX'} 14,880.25`, date:'2025-11-01, 14:35', number:'10,000.5' }; }
}

export type LanguageCurrencySelectorProps = {
  onBack?: ()=>void; onHelp?: ()=>void; onNavChange?: (v:number)=>void;
  onSaveLocaleCurrency?: (p:{ locale:string; currency:string; persist:boolean })=>void;
  supportedLocales?: string[]; supportedCurrencies?: string[];
  defaults?: { locale:string; currency:string };
};

function GlassCard({ children, style }:{ children: React.ReactNode; style?: any }){
  return (
    <BlurView intensity={Platform.OS==='ios'?35:50} tint="light" style={[styles.blurCard, style]}>
      <View style={styles.blurInner}>{children}</View>
    </BlurView>
  );
}

export default function LanguageCurrencySelector({
  onBack, onHelp, onNavChange, onSaveLocaleCurrency,
  supportedLocales=['en-UG','fr-FR','de-DE','sw-KE','en-GB','en-US'],
  supportedCurrencies=['UGX','KES','TZS','USD','EUR','GBP'],
  defaults={ locale:'en-UG', currency:'UGX' }
}: LanguageCurrencySelectorProps){
  const C = useColorTheme();
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: C.primary,
      secondary: C.secondary,
      background: C.surface,
      surface: 'rgba(255,255,255,0.7)'
    },
    roundness: 14,
  } as const;
  const [navValue,setNavValue]=useState(1);
  const [locale,setLocale]=useState(defaults.locale);
  const [currency,setCurrency]=useState(defaults.currency);
  const [persist,setPersist]=useState(true);

  const preview = useMemo(()=> formatPreview(locale, currency), [locale,currency]);

  const save = ()=> onSaveLocaleCurrency?.({ locale, currency, persist });
  const reset = ()=> { setLocale(defaults.locale); setCurrency(defaults.currency); setPersist(true); };

  const Footer=(
    <View style={[styles.footer, { backgroundColor: C.surface, borderTopColor: C.border }]}>
      <Button mode="outlined" icon="backup-restore" onPress={reset}>Reset</Button>
      <Button mode="contained" buttonColor={theme.colors.secondary} textColor={C.onSecondary} onPress={save} style={{ marginLeft:'auto' }}>Save</Button>
    </View>
  );

  return (
    <PaperProvider theme={theme}>
      <View style={[styles.root, { backgroundColor: C.surface }]}>
        <Appbar.Header mode="small" elevated>
          <Appbar.Action icon="arrow-left" onPress={() => (onBack ? onBack() : router.back())}/>
          <Appbar.Content title="Language & currency" titleStyle={{ fontWeight:'700' }} subtitle="override • preview • persist" />
          <Appbar.Action icon="help-circle-outline" onPress={onHelp}/>
        </Appbar.Header>
        <ScrollView contentContainerStyle={styles.content}>
          <GlassCard>
            <Text variant="labelLarge" style={{ fontWeight:'800' }}>Language</Text>
            <TextInput mode="outlined" value={locale} onChangeText={setLocale} right={<TextInput.Icon icon="menu-down" />} />
            <View style={{ height:8 }} />
            <Text variant="labelLarge" style={{ fontWeight:'800' }}>Currency</Text>
            <TextInput mode="outlined" value={currency} onChangeText={setCurrency} right={<TextInput.Icon icon="menu-down" />} />
            <View style={{ flexDirection:'row', alignItems:'center', marginTop:8 }}>
              <Switch value={persist} onValueChange={setPersist} />
              <Text>Persist across sessions</Text>
            </View>
          </GlassCard>

          <GlassCard style={{ marginTop:12, marginBottom:120 }}>
            <Text variant="labelLarge" style={{ fontWeight:'800', marginBottom:6 }}>Preview</Text>
            <Text><Text style={{ fontWeight:'700' }}>Money:</Text> {preview.money}</Text>
            <Text><Text style={{ fontWeight:'700' }}>Date:</Text> {preview.date}</Text>
            <Text><Text style={{ fontWeight:'700' }}>Number:</Text> {preview.number}</Text>
            <Text variant="labelSmall" style={{ opacity:0.7, marginTop:6 }}>Preview uses JavaScript Intl formatting for the selected locale and currency.</Text>
          </GlassCard>
        </ScrollView>
        {/* Global tabs already exist; removed nested BottomNavigation */}
        {Footer}
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  root:{ flex:1 },
  content:{ padding:16 },
  
  footer:{ flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingBottom:12 + Number(Platform.select({ ios: 8, android: 0 })), paddingTop:12, borderTopWidth:StyleSheet.hairlineWidth },
  blurCard:{ borderRadius:14, overflow:'hidden', borderWidth:1, borderColor:'rgba(255,255,255,0.55)' },
  blurInner:{ padding:12, backgroundColor: Platform.select({ ios:'rgba(255,255,255,0.2)', android:'rgba(255,255,255,0.35)' }) },
});
