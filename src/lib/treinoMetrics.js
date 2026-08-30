// Cálculos derivados de sessões de treino — compartilhado entre as telas
// Home, Treinos e Progresso, que precisam das mesmas métricas em cima dos
// mesmos dados brutos (treino + suas execuções).

export function inicioDoDia(data) {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function chaveDia(data) {
  return inicioDoDia(data).toISOString().slice(0, 10);
}

export function feitoHoje(treino) {
  const hojeChave = chaveDia(new Date());
  return treino.sessoes.some((s) => chaveDia(s.dataExecucao) === hojeChave);
}

export function calcularSequencia(sessoes) {
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

export function contarDiasDistintosNaSemana(sessoes) {
  const hoje = inicioDoDia(new Date());
  const diaSemanaAtual = (hoje.getDay() + 6) % 7; // 0 = segunda
  const inicioSemana = new Date(hoje.getTime() - diaSemanaAtual * 86400000);

  const dias = new Set(
    sessoes.filter((s) => new Date(s.dataExecucao) >= inicioSemana).map((s) => chaveDia(s.dataExecucao))
  );
  return dias.size;
}
