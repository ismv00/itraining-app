import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts } from '../constants/theme';
import useTreinosComSessoes from '../lib/useTreinosComSessoes';

const BAR_AREA_HEIGHT = 100;
const MAX_PONTOS_GRAFICO = 6;
const MAX_RANKING = 6;

function formatarDataCurta(data) {
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function DumbbellIcon({ color = colors.goldDark, size = 16 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 8v8M18 8v8M2 12h4M18 12h4M8 12h8" />
    </Svg>
  );
}

function TrendIcon({ positivo, color, size = 12 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      {positivo ? <Path d="M6 18L18 6M18 6H9M18 6v9" /> : <Path d="M6 6l12 12M18 18H9M18 18V9" />}
    </Svg>
  );
}

// Agrupa os registros de todas as sessões (de todos os treinos) por
// exercício, guardando a carga máxima levantada em cada sessão em que ele
// apareceu — a série cronológica usada tanto pro gráfico quanto pra tendência.
function agruparPorExercicio(treinos) {
  const mapa = new Map();

  treinos.forEach((treino) => {
    treino.sessoes.forEach((sessao) => {
      const cargaMaximaNaSessao = new Map();
      sessao.registros.forEach((r) => {
        const peso = Number(r.pesoRealizado);
        const atual = cargaMaximaNaSessao.get(r.exercicioId);
        if (!atual || peso > atual.peso) {
          cargaMaximaNaSessao.set(r.exercicioId, { peso, nome: r.exercicio.nome });
        }
      });
      cargaMaximaNaSessao.forEach((valor, exercicioId) => {
        if (!mapa.has(exercicioId)) {
          mapa.set(exercicioId, { id: exercicioId, nome: valor.nome, pontos: [] });
        }
        mapa.get(exercicioId).pontos.push({ data: sessao.dataExecucao, carga: valor.peso });
      });
    });
  });

  const lista = Array.from(mapa.values());
  lista.forEach((ex) => ex.pontos.sort((a, b) => new Date(a.data) - new Date(b.data)));
  lista.sort((a, b) => b.pontos.length - a.pontos.length);
  return lista;
}

function calcularTendencia(pontos) {
  if (pontos.length < 2) return null;
  const primeiro = pontos[0].carga;
  const ultimo = pontos[pontos.length - 1].carga;
  if (primeiro === 0) return null;
  return Math.round(((ultimo - primeiro) / primeiro) * 100);
}

export default function ProgressoScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { treinos, carregando, erro, recarregar } = useTreinosComSessoes();
  const [exercicioSelecionadoId, setExercicioSelecionadoId] = useState(null);

  const exercicios = agruparPorExercicio(treinos);
  const ranking = exercicios.slice(0, MAX_RANKING);
  const ativoId = exercicioSelecionadoId ?? ranking[0]?.id ?? null;
  const ativo = exercicios.find((e) => e.id === ativoId) ?? null;
  const pontosGrafico = ativo ? ativo.pontos.slice(-MAX_PONTOS_GRAFICO) : [];
  const maxCarga = pontosGrafico.length ? Math.max(...pontosGrafico.map((p) => p.carga)) : 0;

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
          <Text style={styles.title}>Progresso</Text>
          <Text style={styles.subtitle}>Sua evolução ao longo do tempo</Text>

          {exercicios.length === 0 ? (
            <View style={styles.vazioCard}>
              <Text style={styles.vazioText}>
                Registre treinos pra começar a ver aqui sua evolução de carga.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Carga máxima — {ativo.nome} (kg)</Text>
                <View style={styles.bars}>
                  {pontosGrafico.map((ponto, i) => {
                    const altura = maxCarga > 0 ? Math.max(10, (ponto.carga / maxCarga) * BAR_AREA_HEIGHT) : 10;
                    const destaque = i === pontosGrafico.length - 1;
                    return (
                      <View key={`${ponto.data}-${i}`} style={styles.barColumn}>
                        <Text style={styles.barValue}>{ponto.carga}</Text>
                        <View style={styles.barTrack}>
                          <View style={[styles.bar, { height: altura }, destaque && styles.barDestaque]} />
                        </View>
                        <Text style={styles.barLabel}>{formatarDataCurta(ponto.data)}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              <Text style={styles.sectionLbl}>Seus principais exercícios</Text>
              {ranking.map((ex) => {
                const tendencia = calcularTendencia(ex.pontos);
                const cargaAtual = ex.pontos[ex.pontos.length - 1].carga;
                const selecionado = ex.id === ativoId;
                return (
                  <TouchableOpacity
                    key={ex.id}
                    style={[styles.epRow, selecionado && styles.epRowAtiva]}
                    onPress={() => setExercicioSelecionadoId(ex.id)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.epIcon}>
                      <DumbbellIcon />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.epName}>{ex.nome}</Text>
                      <Text style={styles.epDetail}>{cargaAtual} kg atual</Text>
                    </View>
                    {tendencia != null && (
                      <View style={styles.epTrend}>
                        <TrendIcon positivo={tendencia >= 0} color={tendencia >= 0 ? colors.jadeDark : colors.coralDark} />
                        <Text style={[styles.epTrendText, tendencia < 0 && styles.epTrendTextNeg]}>
                          {tendencia > 0 ? '+' : ''}{tendencia}%
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </>
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
  vazioCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
  },
  vazioText: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.textMuted,
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  chartTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 14,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barValue: {
    fontFamily: fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 4,
  },
  barTrack: {
    height: BAR_AREA_HEIGHT,
    width: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    backgroundColor: colors.jadeSoft,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  barDestaque: {
    backgroundColor: colors.jade,
  },
  barLabel: {
    fontFamily: fonts.mono,
    fontSize: 8.5,
    color: colors.textFaint,
    marginTop: 6,
  },
  sectionLbl: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.textFaint,
    marginTop: 6,
    marginBottom: 10,
  },
  epRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 9,
  },
  epRowAtiva: {
    borderColor: colors.coral,
  },
  epIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  epName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.inkS950,
  },
  epDetail: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textFaint,
    marginTop: 1,
  },
  epTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  epTrendText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11.5,
    color: colors.jadeDark,
  },
  epTrendTextNeg: {
    color: colors.coralDark,
  },
});
