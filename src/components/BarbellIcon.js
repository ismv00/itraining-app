import Svg, { Rect } from 'react-native-svg';
import { colors } from '../constants/theme';

// Mesmo desenho usado no ícone do app e na splash screen — haltere/barra de
// academia como forma preenchida (bar + colar + anilhas), não stroke.
export default function BarbellIcon({ color = colors.coral, size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x="10" y="30" width="12" height="40" rx="4" fill={color} />
      <Rect x="22" y="40" width="8" height="20" rx="3" fill={color} />
      <Rect x="30" y="46" width="40" height="8" rx="3" fill={color} />
      <Rect x="70" y="40" width="8" height="20" rx="3" fill={color} />
      <Rect x="78" y="30" width="12" height="40" rx="4" fill={color} />
    </Svg>
  );
}
