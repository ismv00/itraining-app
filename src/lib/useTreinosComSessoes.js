import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import apiFetch from './api';

// Busca os treinos disponíveis do aluno junto com o histórico de sessões de
// cada um. Usado tanto pela tela de Treinos quanto pela de Progresso, que
// precisam exatamente dos mesmos dados brutos (treino + suas execuções).
export default function useTreinosComSessoes() {
  const [treinos, setTreinos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const lista = await apiFetch('/aluno/treinos');
      const comSessoes = await Promise.all(
        lista.map(async (treino) => {
          const sessoes = await apiFetch(`/aluno/treinos/${treino.id}/sessoes`);
          return { ...treino, sessoes };
        })
      );
      setTreinos(comSessoes);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  return { treinos, carregando, erro, recarregar: carregar };
}
