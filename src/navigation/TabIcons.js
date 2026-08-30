import Svg, { Path, Circle } from 'react-native-svg';

// Mesmos paths do referencia/mockup.html (.tab svg), desenhados à mão —
// sem lib de ícones externa, igual ao padrão do web.
const STROKE_WIDTH = 1.9;

function Icon({ color, size, children }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={STROKE_WIDTH} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </Svg>
  );
}

export function TreinosIcon({ color, size = 24 }) {
  return (
    <Icon color={color} size={size}>
      <Path d="M6 8v8M18 8v8M2 12h4M18 12h4M8 12h8" />
    </Icon>
  );
}

export function ProgressoIcon({ color, size = 24 }) {
  return (
    <Icon color={color} size={size}>
      <Path d="M3 3v18h18" />
      <Path d="M7 15l4-5 3 3 5-7" />
    </Icon>
  );
}

export function DietaIcon({ color, size = 24 }) {
  return (
    <Icon color={color} size={size}>
      <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <Path d="M14 2v6h6M9 13h6M9 17h6" />
    </Icon>
  );
}

export function PerfilIcon({ color, size = 24 }) {
  return (
    <Icon color={color} size={size}>
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </Icon>
  );
}
