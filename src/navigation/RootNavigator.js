import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { colors, fonts } from '../constants/theme';
import { TreinosIcon, ProgressoIcon, DietaIcon, PerfilIcon } from './TabIcons';
import TreinosStack from './TreinosStack';
import ProgressoScreen from '../screens/ProgressoScreen';
import DietaScreen from '../screens/DietaScreen';
import PerfilScreen from '../screens/PerfilScreen';

const Tab = createBottomTabNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.paper,
    card: colors.paper,
    border: colors.line,
    primary: colors.coral,
    text: colors.text,
  },
};

function TabBarBackground() {
  return (
    <BlurView
      tint="light"
      intensity={80}
      style={StyleSheet.absoluteFill}
    />
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.coral,
          tabBarInactiveTintColor: colors.textFaint,
          tabBarLabelStyle: styles.tabLabel,
          tabBarStyle: styles.tabBar,
          tabBarBackground: TabBarBackground,
        }}
      >
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

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    elevation: 0,
  },
  tabLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
  },
});
