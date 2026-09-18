import Svg, { Path } from 'react-native-svg';

// Playground structure, side view — a roofed play tower with a ladder and a
// slide chute. Lucide has no playground icon; this follows its 24x24 stroke
// conventions so it sits beside the others. Ported from the design.
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
      <Path d="M3.4 6.8 9.5 1.8l6.1 5" />
      <Path d="M6 21.8V6.8" />
      <Path d="M13 21.8V6.8" />
      <Path d="M6 11.6h7" />
      <Path d="M7.1 15.8h4.8" />
      <Path d="M7.1 18.9h4.8" />
      <Path d="M13 11.6c1.3 6.4 4.7 10.2 9.2 10.2" />
    </Svg>
  );
}
