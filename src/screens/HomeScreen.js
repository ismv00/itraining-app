import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { fonts } from '../constants/theme';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from '../lib/ThemeContext';
import apiFetch from '../lib/api';
import useTreinosComSessoes from '../lib/useTreinosComSessoes';
import { iniciais } from '../lib/text';
import { calcularSequencia, contarDiasDistintosNaSemana } from '../lib/treinoMetrics';

const NOMES_DIA_SEMANA = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado',
];

function numeroBR(valor, casas) {
  return Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const tabBarHeight = useBottomTabBarHeight();
  const { treinos, carregando, erro, recarregar } = useTreinosComSessoes();
  const [perfil, setPerfil] = useState(null);

  useFocusEffect(
    useCallback(() => {
      apiFetch('/aluno/perfil')
        .then(setPerfil)
        .catch(() => {}); // não trava a Home se essa parte falhar
    }, [])
  );

  const todasSessoes = treinos.flatMap((t) => t.sessoes);
  const totalRealizados = todasSessoes.length;
  const sequenciaDias = calcularSequencia(todasSessoes);
  const feitosSemana = contarDiasDistintosNaSemana(todasSessoes);
  const metaSemana = treinos.length;

  const hoje = new Date();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator color={colors.coral} />
        </View>
      ) : erro ? (
        <View style={styles.centro}>
          <Text style={styles.erro}>{erro}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={recarregar} activeOpacity={0.85}>
            <Text style={styles.retryText}>Tentar de novo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Olá, {user?.nome?.split(' ')[0] ?? 'aluno'}</Text>
              <Text style={styles.subtitle}>{NOMES_DIA_SEMANA[hoje.getDay()]} · seu resumo</Text>
            </View>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarSmallText}>{iniciais(user?.nome)}</Text>
            </View>
          </View>

          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Treinos realizados</Text>
            <Text style={styles.heroValue}>{totalRealizados}</Text>
            <Text style={styles.heroSub}>desde que você começou</Text>
          </View>

          <View style={styles.statRow}>
            <View style={[styles.statCard, styles.statCardAlt]}>
              <Text style={styles.statLabelAlt}>Sequência</Text>
              <Text style={styles.statValue}>{sequenciaDias} {sequenciaDias === 1 ? 'dia' : 'dias'}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Esta semana</Text>
              <Text style={styles.statValue}>{feitosSemana}/{metaSemana}</Text>
            </View>
          </View>

          {perfil && (
            <>
              <Text style={styles.sectionLbl}>Seus dados</Text>
              <View style={styles.statTrio}>
                <View style={styles.statItem}>
                  <Text style={styles.statItemValue}>{perfil.idade}</Text>
                  <Text style={styles.statItemLabel}>anos</Text>
                </View>
                <View style={[styles.statItem, styles.statItemBorder]}>
                  <Text style={styles.statItemValue}>{numeroBR(perfil.peso, 1)}</Text>
                  <Text style={styles.statItemLabel}>kg</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statItemValue}>{numeroBR(perfil.altura, 2)}</Text>
                  <Text style={styles.statItemLabel}>m</Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
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
    paddingHorizontal: 20,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  avatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.coralSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  avatarSmallText: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.coralDark,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    letterSpacing: -0.3,
    color: colors.inkS950,
    marginTop: 10,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 18,
  },
  heroCard: {
    backgroundColor: colors.panel950,
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
  },
  heroLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11.5,
    color: '#9AA79C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroValue: {
    fontFamily: fonts.display,
    fontSize: 44,
    color: '#fff',
    marginTop: 4,
  },
  heroSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#9AA79C',
    marginTop: 2,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.panel950,
    borderRadius: 16,
    padding: 14,
  },
  statCardAlt: {
    backgroundColor: colors.coral,
  },
  statLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10.5,
    color: '#9AA79C',
    marginBottom: 6,
  },
  statLabelAlt: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10.5,
    color: '#FFD9CC',
    marginBottom: 6,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: '#fff',
  },
  sectionLbl: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.textFaint,
    marginBottom: 10,
  },
  statTrio: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  statItemBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.line,
  },
  statItemValue: {
    fontFamily: fonts.mono,
    fontSize: 15,
    fontWeight: '600',
    color: colors.inkS950,
  },
  statItemLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textFaint,
    marginTop: 3,
  },
});
