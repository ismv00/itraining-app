import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEY, setOnUnauthorized } from './api';
import { decodeToken } from './auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(TOKEN_KEY).then((stored) => {
      setToken(stored);
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (newToken) => {
    await AsyncStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setAuthMessage('');
  }, []);

  // Aceita opcionalmente uma mensagem pra mostrar na tela de login (ex: sessão
  // expirada). Só usa se for string de verdade — protege contra o erro comum
  // de passar a função direto num onPress (ex: onPress={logout}), que injeta
  // o evento de toque como primeiro argumento em vez de uma mensagem.
  const logout = useCallback(async (mensagem) => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setAuthMessage(typeof mensagem === 'string' ? mensagem : '');
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => logout('Sua sessão foi encerrada. Faça login novamente.'));
  }, [logout]);

  const user = useMemo(() => (token ? decodeToken(token) : null), [token]);

  return (
    <AuthContext.Provider value={{ token, user, isLoading, authMessage, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
