import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { colors, fonts } from '../constants/theme';
import apiFetch from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import { iniciais } from '../lib/text';
import { PerfilIcon } from '../navigation/TabIcons';

function numeroBR(valor, casas) {
  return Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export default function PerfilScreen() {
  const { logout } = useAuth();
  const tabBarHeight = useBottomTabBarHeight();
  const [aluno, setAluno] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarPerfil = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const dados = await apiFetch('/aluno/perfil');
      setAluno(dados);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarPerfil();
  }, [carregarPerfil]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        {carregando ? (
          <View style={styles.centro}>
            <ActivityIndicator color={colors.coral} />
          </View>
        ) : erro ? (
          <View style={styles.centro}>
            <Text style={styles.erro}>{erro}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={carregarPerfil} activeOpacity={0.85}>
              <Text style={styles.retryText}>Tentar de novo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.hero}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{iniciais(aluno.nome)}</Text>
              </View>
              <Text style={styles.name}>{aluno.nome}</Text>
              <Text style={styles.email}>{aluno.email}</Text>
            </View>

            <View style={styles.statTrio}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{aluno.idade}</Text>
                <Text style={styles.statLabel}>anos</Text>
              </View>
              <View style={[styles.statItem, styles.statBorder]}>
                <Text style={styles.statValue}>{numeroBR(aluno.peso, 1)}</Text>
                <Text style={styles.statLabel}>kg</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{numeroBR(aluno.altura, 2)}</Text>
                <Text style={styles.statLabel}>m</Text>
              </View>
            </View>

            <Text style={styles.sectionLbl}>Personal trainer</Text>
            <View style={styles.personalRow}>
              <View style={styles.personalIcon}>
                <PerfilIcon color={colors.textMuted} size={16} />
              </View>
              <View style={{ flex: 1 }}>
                {aluno.personalTrainer?.nome ? (
                  <>
                    <Text style={styles.personalName}>{aluno.personalTrainer.nome}</Text>
                    <Text style={styles.personalSub}>Seu personal trainer atual</Text>
                  </>
                ) : (
                  <Text style={styles.personalName}>Nenhum personal vinculado</Text>
                )}
              </View>
            </View>
          </>
        )}
      </View>

      <View style={{ paddingBottom: tabBarHeight + 12 }}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  erro: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.coralDark,
    textAlign: 'center',
    marginBottom: 14,
  },
  retryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  retryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.text,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 22,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.coralSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.coralDark,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.inkS950,
  },
  email: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  statTrio: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.line,
  },
  statValue: {
    fontFamily: fonts.mono,
    fontSize: 15,
    fontWeight: '600',
    color: colors.inkS950,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textFaint,
    marginTop: 3,
  },
  sectionLbl: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.textFaint,
    marginBottom: 10,
  },
  personalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 15,
  },
  personalIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personalName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13.5,
    color: colors.inkS950,
  },
  personalSub: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.textFaint,
    marginTop: 1,
  },
  logoutButton: {
    backgroundColor: colors.coralSoft,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  logoutText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.coralDark,
  },
});
