// Design tokens, lifted from the app design's Tailwind config so the
// native app and the mock read as the same thing.

export const colors = {
  canvas: '#F7F4EC',
  surface: '#FFFFFF',
  ink: '#1A2117',
  inkSoft: '#5C6656',
  inkFaint: '#8C9486',
  line: '#E2DCCE',
  forest: '#1F4D3A',
  forestDeep: '#123227',
  forestSoft: '#E7EFE9',
  clay: '#BC5B27',
  claySoft: '#FAEDE3',
  white: '#FFFFFF',
};

// Loaded in App.js via expo-font; these are the family names to reference.
export const fonts = {
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
  display: 'Fraunces_600SemiBold',
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

// "float" shadow from the design, expressed for both platforms.
export const shadowFloat = {
  shadowColor: colors.ink,
  shadowOpacity: 0.18,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
};

// Tint a hex colour to ~10% opacity — the design's `${hex}1A` chips.
export const tint = (hex, alpha = '1A') => `${hex}${alpha}`;
