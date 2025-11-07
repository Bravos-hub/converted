// app/receipts/view.tsx
// Expo SDK 54 • TypeScript • expo-router screen
// Native parity for S24_ReceiptViewer.jsx (MUI → React Native Paper)
// Bottom navigation removed (handled by your Tabs layout)
//
// Install deps in your Expo app:
//   expo install expo-blur
//   npm i react-native-paper @expo/vector-icons

import * as React from "react";
import { useMemo, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Stack, router } from "expo-router";
import {
  Provider as PaperProvider,
  Appbar,
  Card,
  Button,
  Text,
  Divider,
  Snackbar,
} from "react-native-paper";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColorTheme } from "../../../../hooks/use-color-theme";

export type Receipt = {
  id: string;
  site: string;
  date: string;
  start: string;
  end: string;
  energy: number;   // kWh
  rate: number;     // per kWh
  amount: number;   // total
};

type Props = {
  currency?: string;
  data?: Partial<Receipt>;
  onBack?: () => void;
  onHelp?: () => void;
  onShare?: (r: Receipt) => void;
  onDownload?: (r: Receipt) => void;
};

export default function ReceiptViewerScreen({
  currency = "UGX",
  data,
  onBack,
  onHelp,
  onShare,
  onDownload,
}: Props) {
  const C = useColorTheme();
  const receipt: Receipt = useMemo(
    () => ({
      id: "ORD-20251018-001",
      site: "Home Charger",
      start: "10:17",
      end: "11:49",
      energy: 12.4,
      rate: 1200,
      amount: 14880,
      date: "2025-10-18",
      ...data,
    }),
    [data]
  );

  const [snack, setSnack] = useState<string | null>(null);

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />

      {/* App bar */}
      <Appbar.Header style={[styles.appbar, { backgroundColor: C.primary }]}>
        <Appbar.Action
          icon={(p) => <MaterialIcons {...p} name="arrow-back-ios" />}
          onPress={() => (onBack ? onBack() : router.back())}
        />
        <Appbar.Content
          title="Receipt"
          subtitle="summary • PDF • share"
          titleStyle={styles.appbarTitle}
        />
        <Appbar.Action
          icon={(p) => <MaterialIcons {...p} name="help-outline" />}
          onPress={onHelp}
        />
      </Appbar.Header>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.card, { borderColor: C.border }]}>
          <View style={styles.cardInner}>
            <View style={styles.rowCenter}>
              <MaterialCommunityIcons name="receipt" size={18} />
              <Text variant="titleSmall" style={[styles.bold, { marginLeft: 6 }]}>
                {receipt.id}
              </Text>
            </View>

            <Divider style={{ marginVertical: 8 }} />

            <Text variant="bodySmall">
              <Text style={styles.bold}>Site: </Text>{receipt.site}
            </Text>
            <Text variant="bodySmall">
              <Text style={styles.bold}>Date: </Text>{receipt.date}
            </Text>
            <Text variant="bodySmall">
              <Text style={styles.bold}>Start: </Text>{receipt.start}
            </Text>
            <Text variant="bodySmall">
              <Text style={styles.bold}>End: </Text>{receipt.end}
            </Text>

            <Divider style={{ marginVertical: 8 }} />

            <Text variant="bodySmall">
              <Text style={styles.bold}>Energy: </Text>{receipt.energy} kWh
            </Text>
            <Text variant="bodySmall">
              <Text style={styles.bold}>Rate: </Text>
              {currency} {receipt.rate.toLocaleString()} / kWh
            </Text>
            <Text variant="titleSmall" style={[styles.bold, { marginTop: 6 }]}>
              Total: {currency} {receipt.amount.toLocaleString()}
            </Text>

            {/* PDF preview placeholder */}
            <Card mode="outlined" style={[styles.preview, { backgroundColor: C.surfaceAlt }]}>
              <Card.Content style={styles.previewInner}>
                <MaterialCommunityIcons name="file-pdf-box" size={28} />
                <Text variant="labelSmall" style={[styles.muted, { color: C.muted }]}>
                  PDF preview coming soon
                </Text>
              </Card.Content>
            </Card>

            {/* Actions */}
            <View style={styles.rowGap}>
              <Button
                mode="outlined"
                icon="share-variant"
                onPress={() => {
                  onShare ? onShare(receipt) : setSnack("Share receipt");
                }}
                style={styles.pill}
              >
                Share
              </Button>
              <Button
                mode="contained"
                icon="download"
                buttonColor={C.secondary}
                textColor={C.onSecondary}
                onPress={() => {
                  onDownload ? onDownload(receipt) : setSnack("Download receipt PDF");
                }}
                style={styles.pill}
              >
                Download
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Snackbar */}
      <Snackbar
        visible={!!snack}
        onDismiss={() => setSnack(null)}
        duration={1500}
      >
        {snack}
      </Snackbar>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  appbar: {},
  appbarTitle: { fontWeight: "800" },
  container: { padding: 16, paddingBottom: 60 },
  card: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    // themed via component
  },
  cardInner: { padding: 12, backgroundColor: "rgba(255,255,255,0.55)" },
  bold: { fontWeight: "800" },
  muted: {},
  rowCenter: { flexDirection: "row", alignItems: "center" },
  rowGap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  pill: { borderRadius: 999, flex: 1 },
  preview: { marginTop: 10 },
  previewInner: {
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
});

/*
================ Usage tests (do not remove) ================
1) Default
<ReceiptViewerScreen />

2) With handlers
<ReceiptViewerScreen
  onShare={(r)=>console.log('share', r)}
  onDownload={(r)=>console.log('download', r)}
/>

Route integration (expo-router):
- Place at app/receipts/view.tsx
- Tabs/nav handled by your layout.
*/
