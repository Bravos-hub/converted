import * as React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Provider as PaperProvider, MD3LightTheme as DefaultTheme, Appbar, Text, Button, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useColorTheme } from '../hooks/use-color-theme';

export default function NotFoundMobile(){
  const router = useRouter();
  const [navValue,setNavValue]=React.useState(0);
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
    roundness: 14
  } as const;
  return (
    <PaperProvider theme={theme}>
      <View style={[styles.root, { backgroundColor: C.surface }]}>
        <Appbar.Header mode="small" elevated style={{ backgroundColor: C.primary }}>
          <Appbar.Action icon="arrow-left" onPress={() => router.back()} color={C.onPrimary} />
          <Appbar.Content title="Not found" titleStyle={{ fontWeight:'800', color: C.onPrimary }} subtitle="404 • screen unavailable" color={C.onPrimary} />
        </Appbar.Header>
        <ScrollView contentContainerStyle={[styles.content,{ paddingTop:16 }]}> 
          <Card mode="outlined" style={{ padding:16, borderRadius:14 }}>
            <Text variant="headlineSmall" style={{ fontWeight:'800' }}>404</Text>
            <Text variant="labelSmall" style={{ opacity:0.7 }}>We could not find what you were looking for.</Text>
            <View style={{ flexDirection:'row', gap:8, justifyContent:'center', marginTop:12 }}>
              <Button mode="contained" buttonColor={theme.colors.secondary} textColor={C.onSecondary} onPress={() => router.replace('/home/dashboard')}>Go to Dashboard</Button>
              <Button mode="outlined" onPress={() => router.replace('/')}>Go Home</Button>
            </View>
          </Card>
        </ScrollView>
        {/* Tabs are provided by the main layout; no extra BottomNavigation here. */}
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  root:{ flex:1 },
  content:{ padding:16 },
  
});
