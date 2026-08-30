import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const TOKEN_KEY = 'itraining_token';

// Chamado quando uma requisição autenticada volta com 401/403 — normalmente
// sinal de token expirado ou conta inativada enquanto o app já estava
// logado. Registrado pelo AuthContext pra forçar logout nesse caso.
let onUnauthorized = null;
export function setOnUnauthorized(callback) {
  onUnauthorized = callback;
}

// Wrapper simples de fetch para falar com o backend iTraining.
// Guarda o token no AsyncStorage após o login (personal ou aluno).
async function apiFetch(path, options = {}) {
  const token = await AsyncStorage.getItem(TOKEN_KEY);

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const erro = await res.json().catch(() => ({ erro: 'Erro desconhecido' }));
    if (token && (res.status === 401 || res.status === 403)) {
      onUnauthorized?.();
    }
    throw new Error(erro.erro || `Erro ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export default apiFetch;
