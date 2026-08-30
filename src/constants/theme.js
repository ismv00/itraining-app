// Paleta e tipografia do iTraining — espelha src/app/globals.css (web) e
// referencia/mockup.html. Não inventar hex code novo fora daqui.

export const colors = {
  inkS950: '#0E1B16',
  inkS800: '#16281F',
  inkS700: '#20392C',

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
