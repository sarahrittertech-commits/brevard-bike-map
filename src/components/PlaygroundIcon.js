import Svg, { Path } from 'react-native-svg';

// A slide, side view: a ladder up to a rounded top and a chute curving down
// to a flat run-out. Chosen by Sarah on 21 October 2026 to replace the play
// tower. Lucide has no playground icon; this follows its 24x24 stroke
// conventions so it sits beside the others.
export default function PlaygroundIcon({ size = 24, color = '#000', strokeWidth = 2 }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M2 21.5 5 4" />
      <Path d="M5 4a2.5 2.5 0 0 1 4.6 1.3" />
      <Path d="M6 21.5 8.9 8" />
      <Path d="M3 16.5h4" />
      <Path d="M3.8 12h4" />
      <Path d="M4.6 7.5h4" />
      <Path d="M9.6 5.3c2.9 0 4.1 1.4 6 5.2 1.6 3.1 2.8 5.8 4.8 5.8h1.5" />
      <Path d="M8.9 8.6c1.9.3 2.6 1.4 4.1 4.2 1.8 3.4 3.1 6.7 7.4 6.7h1.5" />
      <Path d="M21.9 16.3v3.2" />
    </Svg>
  );
}
