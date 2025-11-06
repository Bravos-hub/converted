import { Colors } from '../constants/theme';
import { useColorScheme } from './use-color-scheme';

export type ColorTheme = typeof Colors.light & typeof Colors.dark & typeof Colors['light'];

export function useColorTheme() {
  const scheme = useColorScheme() ?? 'light';
  return Colors[scheme];
}

