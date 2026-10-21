import Svg, { Path } from 'react-native-svg';

// A slide, side view: a straight ladder with two rungs and a single chute
// curving down to the ground. Sarah's choice (option A, 21 October 2026),
// replacing the play tower: kept to six strokes so it still reads as a slide
// inside a 14pt map pin. Lucide has no playground icon; this follows its
// 24x24 stroke conventions so it sits beside the others.
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
      <Path d="M4 21V5" />
      <Path d="M9 21V5" />
      <Path d="M4 5h5" />
      <Path d="M4 10.5h5" />
      <Path d="M4 16h5" />
      <Path d="M9 5c4 0 5 4 7 9s3 6 6 6" />
    </Svg>
  );
}
