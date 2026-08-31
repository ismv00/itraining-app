import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Svg, { Path } from 'react-native-svg';
import { colors as coresFixas, fonts } from '../constants/theme';
import { useTheme } from '../lib/ThemeContext';
import apiFetch from '../lib/api';

const DIAS_SEMANA_VALORES = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
const DIAS_SEMANA_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

function chaveSerie(exercicioId, serieNumero) {
  return `${exercicioId}-${serieNumero}`;
}

function parseNumero(valor) {
  if (!valor) return null;
  const normalizado = String(valor).replace(',', '.');
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : null;
}

function formatarTimer(segundosTotais) {
  const minutos = Math.floor(segundosTotais / 60);
  const segundos = segundosTotais % 60;
  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

// coral não muda entre temas — pode usar a paleta fixa como default aqui.
function ChevronLeft({ color = coresFixas.coral, size = 18 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M15 18l-6-6 6-6" />
    </Svg>
  );
}

function CheckIcon({ color = '#fff', size = 13 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 12l5 5L20 7" />
    </Svg>
  );
}

function DumbbellIcon({ color, size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 8v8M18 8v8M2 12h4M18 12h4M8 12h8" />
    </Svg>
  );
}

function CloseIcon({ color = '#fff', size = 22 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

function WeekStrip({ diasSemana }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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

function ExercicioBlock({ treinoExercicio, registros, onChange }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { exercicio, seriesPrescritas, repeticoesPrescritas } = treinoExercicio;
  const [imagemComErro, setImagemComErro] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const mostrarImagem = Boolean(exercicio.imagemUrl) && !imagemComErro;

  return (
    <View style={styles.exBlock}>
      <View style={styles.exTop}>
        <TouchableOpacity
          style={styles.exThumb}
          onPress={() => mostrarImagem && setModalAberto(true)}
          activeOpacity={mostrarImagem ? 0.8 : 1}
        >
          {mostrarImagem ? (
            <Image
              source={{ uri: exercicio.imagemUrl }}
              style={styles.exThumbImage}
              resizeMode="cover"
              onError={() => setImagemComErro(true)}
            />
          ) : (
            <DumbbellIcon color={colors.goldDark} />
          )}
        </TouchableOpacity>
        <View>
          <Text style={styles.exName}>{exercicio.nome}</Text>
          <Text style={styles.exTarget}>alvo: {seriesPrescritas} × {repeticoesPrescritas}</Text>
        </View>
      </View>

      {mostrarImagem && (
        <Modal visible={modalAberto} transparent animationType="fade" onRequestClose={() => setModalAberto(false)}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalAberto(false)}
          >
            <View style={styles.modalCloseBtn}>
              <CloseIcon />
            </View>
            <Text style={styles.modalTitle}>{exercicio.nome}</Text>
            <Image
              source={{ uri: exercicio.imagemUrl }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Modal>
      )}

      {Array.from({ length: seriesPrescritas }, (_, i) => i + 1).map((serieNumero, idx) => {
        const chave = chaveSerie(treinoExercicio.exercicioId, serieNumero);
        const valor = registros[chave] ?? { reps: '', peso: '' };
        const feito = valor.reps !== '' && valor.peso !== '';

        return (
          <View key={chave} style={[styles.setRow, idx > 0 && styles.setRowBorder]}>
            <Text style={styles.setNum}>{String(serieNumero).padStart(2, '0')}</Text>
            <View style={styles.setInputWrap}>
              <Text style={styles.setLabel}>Reps</Text>
              <TextInput
                style={styles.setInput}
                value={valor.reps}
                onChangeText={(texto) => onChange(chave, { ...valor, reps: texto })}
                placeholder="—"
                placeholderTextColor={colors.textFaint}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.setInputWrap}>
              <Text style={styles.setLabel}>Kg</Text>
              <TextInput
                style={styles.setInput}
                value={valor.peso}
                onChangeText={(texto) => onChange(chave, { ...valor, peso: texto })}
                placeholder="—"
                placeholderTextColor={colors.textFaint}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={[styles.setCheck, feito && styles.setCheckDone]}>
              {feito && <CheckIcon />}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function ExecucaoScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { treinoId, descricao } = route.params;
  const tabBarHeight = useBottomTabBarHeight();

  const [treino, setTreino] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [registros, setRegistros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [segundos, setSegundos] = useState(0);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const dados = await apiFetch(`/aluno/treinos/${treinoId}`);
      setTreino(dados);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [treinoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    const intervalo = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(intervalo);
  }, []);

  function handleChangeSerie(chave, valor) {
    setRegistros((atual) => ({ ...atual, [chave]: valor }));
  }

  const totalPrescrito = useMemo(() => {
    if (!treino) return 0;
    return treino.treinoExercicios.reduce((soma, te) => soma + te.seriesPrescritas, 0);
  }, [treino]);

  async function enviarSessao(registrosPreenchidos) {
    setEnviando(true);
    try {
      await apiFetch(`/aluno/treinos/${treinoId}/sessoes`, {
        method: 'POST',
        body: JSON.stringify({ registros: registrosPreenchidos }),
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erro ao concluir treino', e.message);
    } finally {
      setEnviando(false);
    }
  }

  function handleConcluir() {
    const registrosPreenchidos = [];
    treino.treinoExercicios.forEach((te) => {
      for (let serie = 1; serie <= te.seriesPrescritas; serie++) {
        const valor = registros[chaveSerie(te.exercicioId, serie)];
        const reps = parseNumero(valor?.reps);
        const peso = parseNumero(valor?.peso);
        if (reps != null && peso != null) {
          registrosPreenchidos.push({
            exercicioId: te.exercicioId,
            serieNumero: serie,
            repeticoesRealizadas: reps,
            pesoRealizado: peso,
          });
        }
      }
    });

    if (registrosPreenchidos.length === 0) {
      Alert.alert('Nada registrado', 'Preencha ao menos uma série (reps e kg) antes de concluir.');
      return;
    }

    if (registrosPreenchidos.length < totalPrescrito) {
      const faltando = totalPrescrito - registrosPreenchidos.length;
      Alert.alert(
        'Treino incompleto',
        `Ainda ${faltando === 1 ? 'falta 1 série' : `faltam ${faltando} séries`} sem registro. Deseja concluir mesmo assim?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Concluir mesmo assim', onPress: () => enviarSessao(registrosPreenchidos) },
        ]
      );
      return;
    }

    enviarSessao(registrosPreenchidos);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.backRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft />
          <Text style={styles.backBtnText}>Treinos</Text>
        </TouchableOpacity>
        <View style={styles.timerPill}>
          <Text style={styles.timerPillText}>{formatarTimer(segundos)}</Text>
        </View>
      </View>

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator color={colors.coral} />
        </View>
      ) : erro ? (
        <View style={styles.centro}>
          <Text style={styles.erro}>{erro}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={carregar} activeOpacity={0.85}>
            <Text style={styles.retryText}>Tentar de novo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          <ScrollView
            style={styles.content}
            contentContainerStyle={{ paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.execHeader}>
              <Text style={styles.title}>{treino.descricao ?? descricao}</Text>
              <WeekStrip diasSemana={treino.diasSemana} />
            </View>

            {treino.treinoExercicios.map((te) => (
              <ExercicioBlock
                key={te.id}
                treinoExercicio={te}
                registros={registros}
                onChange={handleChangeSerie}
              />
            ))}
          </ScrollView>

          <View style={[styles.stickyFooter, { paddingBottom: tabBarHeight + 12 }]}>
            <TouchableOpacity
              style={[styles.btnFinish, enviando && styles.btnFinishDisabled]}
              onPress={handleConcluir}
              disabled={enviando}
              activeOpacity={0.85}
            >
              {enviando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.btnFinishText}>Concluir treino</Text>
                  <CheckIcon size={17} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    marginBottom: 6,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  backBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14.5,
    color: colors.coral,
  },
  timerPill: {
    backgroundColor: colors.jadeSoft,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 20,
  },
  timerPillText: {
    fontFamily: fonts.mono,
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.jadeDark,
  },
  execHeader: {
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    letterSpacing: -0.3,
    color: colors.inkS950,
    marginTop: 4,
    marginBottom: 8,
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
  exBlock: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  exTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 12,
  },
  exThumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  exThumbImage: {
    width: '100%',
    height: '100%',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 54,
    right: 20,
    padding: 6,
  },
  modalTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalImage: {
    width: '100%',
    height: 340,
    borderRadius: 16,
  },
  exName: {
    fontFamily: fonts.bodyBold,
    fontSize: 14.5,
    color: colors.inkS950,
  },
  exTarget: {
    fontFamily: fonts.mono,
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  setRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  setNum: {
    width: 24,
    fontFamily: fonts.mono,
    fontSize: 11.5,
    color: colors.textFaint,
    fontWeight: '600',
  },
  setInputWrap: {
    flex: 1,
    gap: 2,
  },
  setLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    color: colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  setInput: {
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 8,
    fontFamily: fonts.mono,
    fontSize: 13,
    textAlign: 'center',
    backgroundColor: colors.paper,
    color: colors.text,
  },
  setCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setCheckDone: {
    backgroundColor: colors.jade,
    borderColor: colors.jade,
  },
  stickyFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.paper,
  },
  btnFinish: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.panel950,
    borderRadius: 16,
    paddingVertical: 15,
  },
  btnFinishDisabled: {
    opacity: 0.7,
  },
  btnFinishText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: '#fff',
  },
});
