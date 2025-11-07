import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

type Props = {
  data: number[];
  color: string;
  height?: number;
  strokeWidth?: number;
  style?: ViewStyle;
  smooth?: boolean;
};

/**
 * Tiny sparkline used across KPI cards. Keeps logic here so screens stay lean.
 */
export function Sparkline({
  data,
  color,
  height = 36,
  strokeWidth = 2,
  style,
}: Props) {
  if (!data || data.length < 2) {
    return null;
  }

  const graphWidth = 100;
  const graphHeight = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * graphWidth;
      const y = graphHeight - ((value - min) / range) * graphHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <View style={[{ height }, style]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${graphWidth} ${graphHeight}`}>
        <Polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
