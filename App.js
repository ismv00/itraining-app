import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { fontAssets, colors } from './src/constants/theme';
import { AuthProvider, useAuth } from './src/lib/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import LoginScreen from './src/screens/LoginScreen';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Root({ fontsLoaded }) {
  const { token, isLoading } = useAuth();
  const pronto = fontsLoaded && !isLoading;

  useEffect(() => {
    if (pronto) {
      SplashScreen.hideAsync();
    }
  }, [pronto]);

  if (!pronto) {
    return <View style={{ flex: 1, backgroundColor: colors.paper }} />;
  }

  return token ? <RootNavigator /> : <LoginScreen />;
}

export default function App() {
  const [fontsLoaded] = useFonts(fontAssets);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <Root fontsLoaded={fontsLoaded} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
