import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { fontAssets } from './src/constants/theme';
import { AuthProvider, useAuth } from './src/lib/AuthContext';
import { ThemeProvider, useTheme } from './src/lib/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import LoginScreen from './src/screens/LoginScreen';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Root({ fontsLoaded }) {
  const { token, isLoading } = useAuth();
  const { colors, escuro, carregado: temaCarregado } = useTheme();
  const pronto = fontsLoaded && !isLoading && temaCarregado;

  useEffect(() => {
    if (pronto) {
      SplashScreen.hideAsync();
    }
  }, [pronto]);

  if (!pronto) {
    return <View style={{ flex: 1, backgroundColor: colors.paper }} />;
  }

  return (
    <>
      <StatusBar style={escuro ? 'light' : 'dark'} />
      {token ? <RootNavigator /> : <LoginScreen />}
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts(fontAssets);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <Root fontsLoaded={fontsLoaded} />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
