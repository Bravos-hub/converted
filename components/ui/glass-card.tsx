import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { useColorTheme } from '../../hooks/use-color-theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
};

export function GlassCard({ children, style, contentStyle }: Props) {
  const C = useColorTheme();

  return (
    <View style={[styles.card, { borderColor: C.glassCardBorder, backgroundColor: C.surface }, style]}>
      <View style={[styles.inner, { backgroundColor: C.surface }, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  inner: {
    padding: 12,
  },
});
