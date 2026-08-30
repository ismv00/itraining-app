// Paleta e tipografia do iTraining — espelha src/app/globals.css (web) e
// referencia/mockup.html. Não inventar hex code novo fora daqui.
//
// inkS950 é usado como cor de texto (títulos) e por isso inverte no tema
// escuro. panel950 é o tom fixo de elementos "sempre escuros" (cards de
// destaque, botão principal) que não muda entre os temas — mesmo espírito
// do panel-950 no painel web.

export const lightColors = {
  inkS950: '#0E1B16',
  panel950: '#0E1B16',

  paper: '#F3F2EC',
  surface: '#FFFFFF',
  line: '#E5E1D3',
  lineStrong: '#D8D3C0',

  text: '#172420',
  textMuted: '#6E756A',
  textFaint: '#9CA097',

  coral: '#FF5B37',
  coralDark: '#B93B20',
  coralSoft: '#FFE3D8',

  jade: '#1F7A5C',
  jadeDark: '#124C39',
  jadeSoft: '#DCEFE5',

  gold: '#DE9C2E',
  goldDark: '#7C540E',
  goldSoft: '#FBEACB',
};

export const darkColors = {
  ...lightColors,

  inkS950: '#F3F2EC',
  panel950: '#0E1B16',

  paper: '#15140F',
  surface: '#1E1C16',
  line: '#33312A',
  lineStrong: '#45412F',

  text: '#EDEFE9',
  textMuted: '#A6A99C',
  textFaint: '#74776A',

  coralDark: '#FF9478',
  coralSoft: '#3D1F16',

  jadeDark: '#6FCDA8',
  jadeSoft: '#12332A',

  goldDark: '#F0B94D',
  goldSoft: '#3A2B0E',
};

// Mantido pra quem só precisa de uma cor fixa fora de tela (ex: ícone com
// cor padrão) — nesses casos não há tema pra reagir mesmo.
export const colors = lightColors;

export const fonts = {
  display: 'SpaceGrotesk_700Bold',
  displaySemiBold: 'SpaceGrotesk_600SemiBold',
  displayMedium: 'SpaceGrotesk_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  mono: 'IBMPlexMono_500Medium',
};

export const fontAssets = {
  SpaceGrotesk_500Medium: require('@expo-google-fonts/space-grotesk/500Medium/SpaceGrotesk_500Medium.ttf'),
  SpaceGrotesk_600SemiBold: require('@expo-google-fonts/space-grotesk/600SemiBold/SpaceGrotesk_600SemiBold.ttf'),
  SpaceGrotesk_700Bold: require('@expo-google-fonts/space-grotesk/700Bold/SpaceGrotesk_700Bold.ttf'),
  Inter_400Regular: require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
  Inter_500Medium: require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
  Inter_600SemiBold: require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'),
  Inter_700Bold: require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
  IBMPlexMono_500Medium: require('@expo-google-fonts/ibm-plex-mono/500Medium/IBMPlexMono_500Medium.ttf'),
};

export const radii = {
  sm: 8,
  md: 14,
  lg: 18,
  xl: 20,
  pill: 999,
};

export const diasSemana = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
