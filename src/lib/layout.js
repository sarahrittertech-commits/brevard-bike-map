import { useWindowDimensions } from 'react-native';

// The width at which the system switches to the regular size class. On iPhone
// Duo that is the inner display in either orientation; on other iPhones only
// the largest ones in landscape reach it.
export const REGULAR_WIDTH = 600;

// The one place layout decisions come from. Apple's iPhone Duo guidance is to
// adapt to the space available rather than to a device model or orientation,
// so this reads only the window size:
//   regular — enough width for wider grids and a capped reading column
//   wide    — wider than tall, so the map sheet docks to the leading side
//             instead of rising from the bottom
export function useLayoutClass() {
  const { width, height } = useWindowDimensions();
  return { width, height, regular: width >= REGULAR_WIDTH, wide: width > height };
}

// Body text stops growing past this on regular width.
export const READING_WIDTH = 600;

// A 3:2 photo at full width, but never more than 40% of the window's height —
// at 951pt wide it would otherwise fill the screen.
export function photoHeight(width, windowHeight) {
  return Math.round(Math.min(width / 1.5, windowHeight * 0.4));
}
