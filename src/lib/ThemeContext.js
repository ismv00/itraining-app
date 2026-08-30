import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../constants/theme';

const THEME_KEY = 'itraining_theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const sistemaEscuro = useColorScheme() === 'dark';
  const [preferencia, setPreferencia] = useState(null); // 'light' | 'dark' | null (segue o sistema)
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((valor) => {
      setPreferencia(valor);
      setCarregado(true);
    });
  }, []);

  const escuro = preferencia ? preferencia === 'dark' : sistemaEscuro;

  const alternarTema = useCallback(async () => {
    const novaPreferencia = escuro ? 'light' : 'dark';
    setPreferencia(novaPreferencia);
    await AsyncStorage.setItem(THEME_KEY, novaPreferencia);
  }, [escuro]);

  const colors = useMemo(() => (escuro ? darkColors : lightColors), [escuro]);

  return (
    <ThemeContext.Provider value={{ colors, escuro, alternarTema, carregado }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
