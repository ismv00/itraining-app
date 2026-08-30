import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { fonts } from '../constants/theme';
import { useTheme } from '../lib/ThemeContext';
import { HomeIcon, TreinosIcon, ProgressoIcon, DietaIcon, PerfilIcon } from './TabIcons';
import HomeScreen from '../screens/HomeScreen';
import TreinosStack from './TreinosStack';
import ProgressoScreen from '../screens/ProgressoScreen';
import DietaScreen from '../screens/DietaScreen';
import PerfilScreen from '../screens/PerfilScreen';

const Tab = createBottomTabNavigator();

function TabBarBackground({ escuro }) {
  return (
    <BlurView
      tint={escuro ? 'dark' : 'light'}
      intensity={80}
      style={StyleSheet.absoluteFill}
    />
  );
}

export default function RootNavigator() {
  const { colors, escuro } = useTheme();

  const navigationTheme = {
    ...(escuro ? DarkTheme : DefaultTheme),
    colors: {
      ...(escuro ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.paper,
      card: colors.paper,
      border: colors.line,
      primary: colors.coral,
      text: colors.text,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.coral,
          tabBarInactiveTintColor: colors.textFaint,
          tabBarLabelStyle: { fontFamily: fonts.bodySemiBold, fontSize: 10 },
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.line,
            elevation: 0,
          },
          tabBarBackground: () => <TabBarBackground escuro={escuro} />,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Início',
            tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Treinos"
          component={TreinosStack}
          options={{ tabBarIcon: ({ color, size }) => <TreinosIcon color={color} size={size} /> }}
        />
        <Tab.Screen
          name="Progresso"
          component={ProgressoScreen}
          options={{ tabBarIcon: ({ color, size }) => <ProgressoIcon color={color} size={size} /> }}
        />
        <Tab.Screen
          name="Dieta"
          component={DietaScreen}
          options={{ tabBarIcon: ({ color, size }) => <DietaIcon color={color} size={size} /> }}
        />
        <Tab.Screen
          name="Perfil"
          component={PerfilScreen}
          options={{ tabBarIcon: ({ color, size }) => <PerfilIcon color={color} size={size} /> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
