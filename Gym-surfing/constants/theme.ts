/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#F06A4D';
const tintColorDark = '#F06A4D';

export const Colors = {
  light: {
    text: '#1A1A1A',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#666666',
    tabIconDefault: '#666666',
    tabIconSelected: tintColorLight,
    // GymSurf design tokens
    accentCoral: '#F06A4D',
    accentYellow: '#F5BA55',
    bgGray: '#EBEAE5',
    bgLight: '#FAFAFA',
    textMuted: '#666666',
    borderColor: '#E0E0E0',
    // Chat quiz colors
    bubbleBot: '#EBEAE5',
    bubbleBotText: '#1A1A1A',
    bubbleUser: '#F06A4D',
    bubbleUserText: '#FFFFFF',
    chipBg: '#FAFAFA',
    chipBorder: '#E0E0E0',
    chipActiveBg: '#F06A4D',
    chipActiveText: '#FFFFFF',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // GymSurf design tokens
    accentCoral: '#F06A4D',
    accentYellow: '#F5BA55',
    bgGray: '#2A2D2E',
    bgLight: '#1E2122',
    textMuted: '#9BA1A6',
    borderColor: '#333738',
    // Chat quiz colors
    bubbleBot: '#2A2D2E',
    bubbleBotText: '#ECEDEE',
    bubbleUser: '#F06A4D',
    bubbleUserText: '#FFFFFF',
    chipBg: '#1E2122',
    chipBorder: '#333738',
    chipActiveBg: '#F06A4D',
    chipActiveText: '#FFFFFF',
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
