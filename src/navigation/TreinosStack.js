import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TreinosScreen from '../screens/TreinosScreen';
import ExecucaoScreen from '../screens/ExecucaoScreen';

const Stack = createNativeStackNavigator();

export default function TreinosStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TreinosLista" component={TreinosScreen} />
      <Stack.Screen name="Execucao" component={ExecucaoScreen} />
    </Stack.Navigator>
  );
}
