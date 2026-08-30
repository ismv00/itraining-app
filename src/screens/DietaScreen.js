import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { WebView } from 'react-native-webview';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors as coresFixas, fonts } from '../constants/theme';
import { useTheme } from '../lib/ThemeContext';
import apiFetch from '../lib/api';
import { DietaIcon } from '../navigation/TabIcons';

const SEM_DIETA_MSG = 'Nenhuma dieta cadastrada ainda';
const API_URL = process.env.EXPO_PUBLIC_API_URL;

function formatarDataCurta(data) {
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function formatarDataCompleta(data) {
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// coral não muda entre temas — pode usar a paleta fixa como default aqui.
function ChevronLeft({ color = coresFixas.coral, size = 18 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M15 18l-6-6 6-6" />
    </Svg>
  );
}

function EyeIcon({ color = '#fff', size = 15 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <Circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

export default function DietaScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const tabBarHeight = useBottomTabBarHeight();
  const [dieta, setDieta] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [visualizando, setVisualizando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      let atual = null;
      try {
        atual = await apiFetch('/aluno/dieta');
      } catch (e) {
        if (e.message !== SEM_DIETA_MSG) throw e;
      }
      const hist = await apiFetch('/aluno/dieta/historico');
      setDieta(atual);
      setHistorico(hist);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const pdfUrl = dieta ? `${API_URL}${dieta.arquivoUrl}` : null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Dieta</Text>
          <Text style={styles.subtitle}>Plano nutricional atualizado pelo seu personal</Text>

          {!dieta ? (
            <View style={styles.vazioCard}>
              <Text style={styles.vazioText}>Seu personal ainda não enviou nenhuma dieta em PDF.</Text>
            </View>
          ) : (
            <View style={styles.pdfHero}>
              <Text style={styles.pdfHeroLabel}>Vigente desde {formatarDataCurta(dieta.createdAt)}</Text>
              <Text style={styles.pdfHeroFname} numberOfLines={2}>{dieta.nomeArquivo}</Text>
              <TouchableOpacity style={styles.btnView} onPress={() => setVisualizando(true)} activeOpacity={0.85}>
                <EyeIcon />
                <Text style={styles.btnViewText}>Abrir PDF</Text>
              </TouchableOpacity>
            </View>
          )}

          {historico.length > 0 && (
            <>
              <Text style={styles.sectionLbl}>Histórico de versões</Text>
              {historico.map((versao, i) => (
                <View key={versao.id} style={styles.versionRow}>
                  <View style={styles.versionIcon}>
                    <DietaIcon color={colors.textMuted} size={16} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.versionName} numberOfLines={1}>{versao.nomeArquivo}</Text>
                    <Text style={styles.versionDate}>{formatarDataCompleta(versao.createdAt)}</Text>
                  </View>
                  {i === 0 && (
                    <View style={styles.versionCurrent}>
                      <Text style={styles.versionCurrentText}>Atual</Text>
                    </View>
                  )}
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}

      <Modal visible={visualizando} animationType="slide" onRequestClose={() => setVisualizando(false)}>
        <SafeAreaProvider>
          <SafeAreaView style={styles.modalContainer} edges={['top', 'left', 'right', 'bottom']}>
            <View style={styles.modalHeader}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setVisualizando(false)} activeOpacity={0.7}>
                <ChevronLeft />
                <Text style={styles.backBtnText}>Fechar</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle} numberOfLines={1}>{dieta?.nomeArquivo}</Text>
              <View style={{ width: 60 }} />
            </View>
            {pdfUrl && (
              <WebView
                source={{ uri: pdfUrl }}
                style={{ flex: 1 }}
                startInLoadingState
                renderLoading={() => (
                  <View style={styles.centro}>
                    <ActivityIndicator color={colors.coral} />
                  </View>
                )}
              />
            )}
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
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
  pdfHero: {
    backgroundColor: colors.panel950,
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
  },
  pdfHeroLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: '#9AA79C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pdfHeroFname: {
    fontFamily: fonts.display,
    fontSize: 19,
    color: '#fff',
    marginBottom: 16,
  },
  btnView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: colors.coral,
    borderRadius: 12,
    paddingVertical: 11,
  },
  btnViewText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: '#fff',
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
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 15,
    marginBottom: 9,
  },
  versionIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.inkS950,
  },
  versionDate: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textFaint,
    marginTop: 1,
  },
  versionCurrent: {
    backgroundColor: colors.jadeSoft,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  versionCurrentText: {
    fontFamily: fonts.bodyBold,
    fontSize: 9.5,
    color: colors.jadeDark,
    textTransform: 'uppercase',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    width: 70,
  },
  backBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14.5,
    color: colors.coral,
  },
  modalTitle: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.inkS950,
    textAlign: 'center',
  },
});
