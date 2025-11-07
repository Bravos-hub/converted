/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#0a7ea4';

// Centralized color tokens for the app brand and UI
export const Colors = {
  light: {
    // Base
    text: '#111111',
    background: '#ffffff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,

    // Brand
    primary: '#03cd8c',        // EVzone green
    secondary: '#f77f00',      // EVzone orange
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',

    // Surfaces and neutrals
    surface: '#ffffff',        // cards / app background alt
    surfaceAlt: '#fafafa',
    border: '#eef3f1',
    muted: '#6b7280',

    // Status
    success: '#03cd8c',
    successBg: '#e6fff5',
    warning: '#f59e0b',
    warningBg: '#fff3cd',
    error: '#d32f2f',
    errorBg: '#fdecea',
    info: '#0ea5e9',

    // Glass accents (used for blur cards)
    // Slight grey border to pop on white backgrounds, soft white overlay
    glassCardBorder: 'rgba(0,0,0,0.06)',
    glassCardBg: 'rgba(255,255,255,0.72)'
  },
  dark: {
    // Force light-like palette to keep white backgrounds even in dark mode
    text: '#111111',
    background: '#ffffff',
    tint: tintColorDark,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorDark,

    // Brand
    primary: '#03cd8c',
    secondary: '#f77f00',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',

    // Surfaces and neutrals
    surface: '#ffffff',
    surfaceAlt: '#fafafa',
    border: '#eef3f1',
    muted: '#6b7280',

    // Status
    success: '#03cd8c',
    successBg: '#e6fff5',
    warning: '#f59e0b',
    warningBg: '#fff3cd',
    error: '#d32f2f',
    errorBg: '#fdecea',
    info: '#0ea5e9',

    // Glass accents on white background as well
    glassCardBorder: 'rgba(0,0,0,0.06)',
    glassCardBg: 'rgba(255,255,255,0.72)'
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
