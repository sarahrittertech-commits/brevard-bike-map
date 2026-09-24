import Beer from 'lucide-react-native/icons/beer';
import Bike from 'lucide-react-native/icons/bike';
import IceCreamCone from 'lucide-react-native/icons/ice-cream-cone';
import Wrench from 'lucide-react-native/icons/wrench';

import PlaygroundIcon from './PlaygroundIcon';

const ICONS = {
  'ice-cream': IceCreamCone,
  playground: PlaygroundIcon,
  brewery: Beer,
  'bike-shop': Bike,
  repair: Wrench,
};

// One glyph per category, used in the rail, rows, chips and map pins.
export default function CategoryIcon({ category, size = 20, color, strokeWidth = 2.1 }) {
  const Icon = ICONS[category] ?? Wrench;
  return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
}
