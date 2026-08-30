import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fonts } from '../constants/theme';
import apiFetch from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import BarbellIcon from '../components/BarbellIcon';

export default function LoginScreen() {
  const { login, authMessage } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit() {
    if (!email || !senha) {
      setErro('Preencha email e senha');
      return;
    }
    setErro('');
    setCarregando(true);
    try {
      const { token } = await apiFetch('/auth/aluno/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      });
      await login(token);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <View style={styles.brandRow}>
          <BarbellIcon color={colors.coral} size={16} />
          <Text style={styles.brand}>ITRAINING</Text>
        </View>
        <Text style={styles.title}>Entrar</Text>
        <Text style={styles.subtitle}>Entre com o email e senha cadastrados pelo seu personal.</Text>

        {authMessage ? <Text style={styles.authMessage}>{authMessage}</Text> : null}

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            placeholder="••••••••"
            placeholderTextColor={colors.textFaint}
            secureTextEntry
          />
        </View>

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <TouchableOpacity
          style={[styles.button, carregando && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={carregando}
          activeOpacity={0.85}
        >
          {carregando ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  brand: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.coral,
    letterSpacing: 2,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.inkS950,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 28,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  erro: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.coralDark,
    marginBottom: 12,
  },
  authMessage: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.goldDark,
    backgroundColor: colors.goldSoft,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.coral,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: '#fff',
  },
});
