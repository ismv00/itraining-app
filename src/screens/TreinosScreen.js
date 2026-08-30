import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts } from '../constants/theme';
import { useAuth } from '../lib/AuthContext';
import useTreinosComSessoes from '../lib/useTreinosComSessoes';
import { iniciais } from '../lib/text';

const DIAS_SEMANA_VALORES = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
const DIAS_SEMANA_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
const NOMES_DIA_SEMANA = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado',
];
const DIAS_SEMANA_POR_GETDAY = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

function diaSemanaHoje() {
  return DIAS_SEMANA_POR_GETDAY[new Date().getDay()];
}

function inicioDoDia(data) {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d;
}

function chaveDia(data) {
  return inicioDoDia(data).toISOString().slice(0, 10);
}

function feitoHoje(treino) {
  const hojeChave = chaveDia(new Date());
  return treino.sessoes.some((s) => chaveDia(s.dataExecucao) === hojeChave);
}

function calcularSequencia(sessoes) {
  if (sessoes.length === 0) return 0;
  const dias = new Set(sessoes.map((s) => chaveDia(s.dataExecucao)));
  const maisRecenteChave = [...dias].sort().reverse()[0];
  const hoje = inicioDoDia(new Date());
  const diffDias = Math.round((hoje - new Date(`${maisRecenteChave}T00:00:00`)) / 86400000);
  if (diffDias > 1) return 0;

  let streak = 0;
  let cursor = new Date(`${maisRecenteChave}T00:00:00`);
  while (dias.has(chaveDia(cursor))) {
    streak++;
    cursor = new Date(cursor.getTime() - 86400000);
  }
  return streak;
}

function contarDiasDistintosNaSemana(sessoes) {
  const hoje = inicioDoDia(new Date());
  const diaSemanaAtual = (hoje.getDay() + 6) % 7; // 0 = segunda
  const inicioSemana = new Date(hoje.getTime() - diaSemanaAtual * 86400000);

  const dias = new Set(
    sessoes.filter((s) => new Date(s.dataExecucao) >= inicioSemana).map((s) => chaveDia(s.dataExecucao))
  );
  return dias.size;
}

function formatarRelativo(data) {
  const dias = Math.round((inicioDoDia(new Date()) - inicioDoDia(data)) / 86400000);
  if (dias <= 0) return 'hoje';
  if (dias === 1) return 'ontem';
  return `há ${dias} dias`;
}

function totalSeriesPrescritas(treino) {
  return (treino.treinoExercicios ?? []).reduce((soma, te) => soma + te.seriesPrescritas, 0);
}

function seriesRegistradasNaSessao(sessao) {
  const chaves = new Set(sessao.registros.map((r) => `${r.exercicioId}-${r.serieNumero}`));
  return chaves.size;
}

function percentualConclusao(treino, sessao) {
  const total = totalSeriesPrescritas(treino);
  if (!sessao || total === 0) return 0;
  return Math.min(100, Math.round((seriesRegistradasNaSessao(sessao) / total) * 100));
}

function ChevronRight({ color = '#fff', size = 12 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 6l6 6-6 6" />
    </Svg>
  );
}

function WeekStrip({ diasSemana }) {
  return (
    <View style={styles.weekStrip}>
      {DIAS_SEMANA_VALORES.map((valor, i) => {
        const ativo = diasSemana.includes(valor);
        return (
          <View key={valor} style={[styles.weekDay, ativo && styles.weekDayOn]}>
            <Text style={[styles.weekDayText, ativo && styles.weekDayTextOn]}>{DIAS_SEMANA_LABELS[i]}</Text>
          </View>
        );
      })}
    </View>
  );
}

function TreinoCard({ treino, onIniciar, destaque, mostrarPercentual }) {
  const feito = treino.sessoes.length > 0;
  const ultimaSessao = feito
    ? treino.sessoes.reduce((a, b) => (new Date(a.dataExecucao) > new Date(b.dataExecucao) ? a : b))
    : null;
  const qtdExercicios = treino._count?.treinoExercicios ?? 0;
  const percentual = mostrarPercentual ? percentualConclusao(treino, ultimaSessao) : null;
  const podeIniciar = !feitoHoje(treino);

  return (
    <View style={[styles.card, destaque && styles.cardDestaque]}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{treino.descricao}</Text>
          <Text style={styles.cardMeta}>
            {qtdExercicios} {qtdExercicios === 1 ? 'exercício' : 'exercícios'}
          </Text>
        </View>
        {!feito ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Novo</Text>
          </View>
        ) : mostrarPercentual ? (
          <View style={styles.badgeFeito}>
            <Text style={styles.badgeFeitoText}>{percentual === 100 ? 'Feito' : `${percentual}%`}</Text>
          </View>
        ) : null}
      </View>

      <WeekStrip diasSemana={treino.diasSemana} />

      <View style={styles.cardBottom}>
        <Text style={styles.cardFooterText} numberOfLines={1}>
          {feito ? `último: ${formatarRelativo(ultimaSessao.dataExecucao)}` : `enviado por ${treino.personalTrainer?.nome ?? 'seu personal'}`}
        </Text>
        {podeIniciar && (
          <TouchableOpacity style={styles.btnStart} onPress={() => onIniciar(treino)} activeOpacity={0.85}>
            <Text style={styles.btnStartText}>Iniciar</Text>
            <ChevronRight />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function TreinosScreen({ navigation }) {
  const { user } = useAuth();
  const tabBarHeight = useBottomTabBarHeight();
  const { treinos, carregando, erro, recarregar } = useTreinosComSessoes();
  const [aba, setAba] = useState('disponiveis');

  function handleIniciar(treino) {
    navigation.navigate('Execucao', { treinoId: treino.id, descricao: treino.descricao });
  }

  const todasSessoes = treinos.flatMap((t) => t.sessoes);
  const sequenciaDias = calcularSequencia(todasSessoes);
  const feitosSemana = contarDiasDistintosNaSemana(todasSessoes);
  const metaSemana = treinos.length;

  const listaFiltrada =
    aba === 'disponiveis'
      ? treinos.filter((t) => !feitoHoje(t))
      : treinos.filter((t) => feitoHoje(t));

  const diaHoje = diaSemanaHoje();
  const treinosDeHoje =
    aba === 'disponiveis' ? listaFiltrada.filter((t) => t.diasSemana.includes(diaHoje)) : [];
  const outrosTreinos =
    aba === 'disponiveis' ? listaFiltrada.filter((t) => !t.diasSemana.includes(diaHoje)) : [];

  const hoje = new Date();
  const subtitulo = `${NOMES_DIA_SEMANA[hoje.getDay()]} · pronta pra treinar hoje?`;

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
              <Text style={styles.subtitle}>{subtitulo}</Text>
            </View>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarSmallText}>{iniciais(user?.nome)}</Text>
            </View>
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

          <View style={styles.segmented}>
            <TouchableOpacity
              style={[styles.seg, aba === 'disponiveis' && styles.segActive]}
              onPress={() => setAba('disponiveis')}
              activeOpacity={0.85}
            >
              <Text style={[styles.segText, aba === 'disponiveis' && styles.segTextActive]}>Disponíveis</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.seg, aba === 'concluidos' && styles.segActive]}
              onPress={() => setAba('concluidos')}
              activeOpacity={0.85}
            >
              <Text style={[styles.segText, aba === 'concluidos' && styles.segTextActive]}>Concluídos</Text>
            </TouchableOpacity>
          </View>

          {listaFiltrada.length === 0 ? (
            <Text style={styles.vazio}>
              {aba === 'disponiveis' ? 'Nenhum treino disponível no momento.' : 'Você ainda não concluiu nenhum treino hoje.'}
            </Text>
          ) : aba === 'disponiveis' && treinosDeHoje.length > 0 ? (
            <>
              <Text style={styles.sectionLbl}>{treinosDeHoje.length > 1 ? 'Treinos de hoje' : 'Treino de hoje'}</Text>
              {treinosDeHoje.map((treino) => (
                <TreinoCard key={treino.id} treino={treino} onIniciar={handleIniciar} mostrarPercentual={false} destaque />
              ))}

              {outrosTreinos.length > 0 && (
                <>
                  <Text style={styles.sectionLbl}>Outros treinos disponíveis</Text>
                  {outrosTreinos.map((treino) => (
                    <TreinoCard key={treino.id} treino={treino} onIniciar={handleIniciar} mostrarPercentual={false} />
                  ))}
                </>
              )}
            </>
          ) : (
            listaFiltrada.map((treino) => (
              <TreinoCard
                key={treino.id}
                treino={treino}
                onIniciar={handleIniciar}
                mostrarPercentual={aba === 'concluidos'}
              />
            ))
          )}
        </ScrollView>
      )}
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
  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.inkS950,
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
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.line,
    borderRadius: 10,
    padding: 3,
    marginBottom: 18,
  },
  seg: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 8,
  },
  segActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  segText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  segTextActive: {
    color: colors.inkS950,
  },
  vazio: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 20,
  },
  sectionLbl: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.textFaint,
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  cardDestaque: {
    borderColor: colors.coral,
    borderWidth: 2,
    shadowColor: colors.coral,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.inkS950,
  },
  cardMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  badge: {
    backgroundColor: colors.jadeSoft,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    color: colors.jadeDark,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  badgeFeito: {
    backgroundColor: colors.goldSoft,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  badgeFeitoText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    color: colors.goldDark,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  weekStrip: {
    flexDirection: 'row',
    gap: 3,
  },
  weekDay: {
    width: 17,
    height: 17,
    borderRadius: 5,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayOn: {
    backgroundColor: colors.coral,
    borderColor: colors.coral,
  },
  weekDayText: {
    fontFamily: fonts.mono,
    fontSize: 8.5,
    color: colors.textFaint,
  },
  weekDayTextOn: {
    color: '#fff',
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    gap: 10,
  },
  cardFooterText: {
    flex: 1,
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textFaint,
  },
  btnStart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.coral,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  btnStartText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: '#fff',
  },
});
