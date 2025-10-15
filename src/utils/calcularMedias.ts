import { type Tarefa } from '../types';
import type { PeticaoInicial } from '../types';

/**
 * Calcula a média diária de tarefas completas
 * @param tarefasCompletas - Array de tarefas completas
 * @returns Média de tarefas por dia
 */
export const calcularMediaDiaria = (tarefasCompletas: Tarefa[]): number => {
  if (!tarefasCompletas.length) return 0;

  // Agrupar tarefas por data de conclusão
  const tarefasPorDia: Record<string, number> = {};
  
  tarefasCompletas.forEach((tarefa) => {
    if (tarefa.users && tarefa.users[0] && tarefa.users[0].completed) {
      // Extrair apenas a data (sem horário) da string de completed
      const data = new Date(tarefa.users[0].completed).toISOString().split('T')[0];
      tarefasPorDia[data] = (tarefasPorDia[data] || 0) + 1;
    }
  });

  const dias = Object.keys(tarefasPorDia);
  if (dias.length === 0) return 0;

  const totalTarefas = Object.values(tarefasPorDia).reduce((acc, count) => acc + count, 0);
  return Math.round((totalTarefas / dias.length) * 100) / 100; // Arredondar para 2 casas decimais
};

/**
 * Calcula a média semanal mensal de tarefas completas
 * @param tarefasCompletas - Array de tarefas completas
 * @returns Média de tarefas por semana dentro do mês
 */
export const calcularMediaSemanalMensal = (tarefasCompletas: Tarefa[]): number => {
  if (!tarefasCompletas.length) return 0;

  // Filtrar tarefas do mês e agrupar por semana
  const tarefasPorSemana: Record<string, number> = {};
  
  tarefasCompletas.forEach((tarefa) => {
    if (tarefa.users && tarefa.users[0] && tarefa.users[0].completed) {
      const data = new Date(tarefa.users[0].completed);
      const ano = data.getFullYear();
      const mes = data.getMonth();
      
      // Calcular qual semana do mês (1-6, pois um mês pode ter até 6 semanas)
      const primeiroDiaMes = new Date(ano, mes, 1);
      const diaMes = data.getDate();
      const semanaDoMes = Math.ceil((diaMes + primeiroDiaMes.getDay()) / 7);
      
      const chaveSemana = `${ano}-${mes + 1}-W${semanaDoMes}`;
      tarefasPorSemana[chaveSemana] = (tarefasPorSemana[chaveSemana] || 0) + 1;
    }
  });

  const semanas = Object.keys(tarefasPorSemana);
  if (semanas.length === 0) return 0;

  const totalTarefas = Object.values(tarefasPorSemana).reduce((acc, count) => acc + count, 0);
  return Math.round((totalTarefas / semanas.length) * 100) / 100; // Arredondar para 2 casas decimais
};

/**
 * Interface para médias de responsáveis
 */
export interface MediaResponsavel {
  responsavel: string;
  mediaDiaria: number;
  mediaSemanal: number;
  totalAnalises: number;
  diasAtivos: number;
  semanasAtivas: number;
}

/**
 * Calcula médias diárias e semanais para cada responsável pela análise
 * @param peticoes - Array de petições com dados de análise
 * @returns Array com médias por responsável
 */
export const calcularMediasResponsaveis = (peticoes: PeticaoInicial[]): MediaResponsavel[] => {
  // Filtra apenas petições com responsável e data válidos
  const peticoesValidas = peticoes.filter(p => 
    p.respAnalise && 
    p.respAnalise.trim().length > 0 && 
    p.respAnalise.toLowerCase() !== 'não informado' &&
    p.data
  );

  // Agrupa por responsável
  const agrupamentoPorResponsavel: Record<string, PeticaoInicial[]> = {};
  
  peticoesValidas.forEach(peticao => {
    const responsavel = peticao.respAnalise!.trim();
    if (!agrupamentoPorResponsavel[responsavel]) {
      agrupamentoPorResponsavel[responsavel] = [];
    }
    agrupamentoPorResponsavel[responsavel].push(peticao);
  });

  // Calcula médias para cada responsável
  return Object.entries(agrupamentoPorResponsavel).map(([responsavel, peticoesDoResponsavel]) => {
    // Agrupa por dia
    const analisesPorDia: Record<string, number> = {};
    // Agrupa por semana
    const analisesPorSemana: Record<string, number> = {};

    peticoesDoResponsavel.forEach(peticao => {
      if (peticao.data) {
        // Chave do dia (YYYY-MM-DD)
        const chaveDia = peticao.data.toISOString().split('T')[0];
        analisesPorDia[chaveDia] = (analisesPorDia[chaveDia] || 0) + 1;

        // Chave da semana (YYYY-Www - ISO week)
        const ano = peticao.data.getFullYear();
        const inicioAno = new Date(ano, 0, 1);
        const diasDecorridos = Math.floor((peticao.data.getTime() - inicioAno.getTime()) / (24 * 60 * 60 * 1000));
        const semanaDoAno = Math.ceil((diasDecorridos + inicioAno.getDay() + 1) / 7);
        const chaveSemana = `${ano}-W${String(semanaDoAno).padStart(2, '0')}`;
        analisesPorSemana[chaveSemana] = (analisesPorSemana[chaveSemana] || 0) + 1;
      }
    });

    const diasAtivos = Object.keys(analisesPorDia).length;
    const semanasAtivas = Object.keys(analisesPorSemana).length;
    const totalAnalises = peticoesDoResponsavel.length;

    // Calcula médias
    const mediaDiaria = diasAtivos > 0 ? 
      Math.round((totalAnalises / diasAtivos) * 100) / 100 : 0;
    
    const mediaSemanal = semanasAtivas > 0 ? 
      Math.round((totalAnalises / semanasAtivas) * 100) / 100 : 0;

    return {
      responsavel,
      mediaDiaria,
      mediaSemanal,
      totalAnalises,
      diasAtivos,
      semanasAtivas
    };
  }).sort((a, b) => b.totalAnalises - a.totalAnalises); // Ordena por total de análises
};

/**
 * Calcula médias diárias e semanais para cada responsável pela petição
 * @param peticoes - Array de petições com dados de petição
 * @returns Array com médias por responsável pela petição
 */
export const calcularMediasResponsaveisPeticao = (peticoes: PeticaoInicial[]): MediaResponsavel[] => {
  // Filtra apenas petições com responsável pela petição e data válidos
  const peticoesValidas = peticoes.filter(p => 
    p.respPeticao && 
    p.respPeticao.trim().length > 0 && 
    p.respPeticao.toLowerCase() !== 'não informado' &&
    p.data
  );

  // Agrupa por responsável pela petição
  const agrupamentoPorResponsavel: Record<string, PeticaoInicial[]> = {};
  
  peticoesValidas.forEach(peticao => {
    const responsavel = peticao.respPeticao!.trim();
    if (!agrupamentoPorResponsavel[responsavel]) {
      agrupamentoPorResponsavel[responsavel] = [];
    }
    agrupamentoPorResponsavel[responsavel].push(peticao);
  });

  // Calcula médias para cada responsável
  return Object.entries(agrupamentoPorResponsavel).map(([responsavel, peticoesDoResponsavel]) => {
    // Agrupa por dia
    const peticoesPorDia: Record<string, number> = {};
    // Agrupa por semana
    const peticoesPorSemana: Record<string, number> = {};

    peticoesDoResponsavel.forEach(peticao => {
      if (peticao.data) {
        // Chave do dia (YYYY-MM-DD)
        const chaveDia = peticao.data.toISOString().split('T')[0];
        peticoesPorDia[chaveDia] = (peticoesPorDia[chaveDia] || 0) + 1;

        // Chave da semana (YYYY-Www - ISO week)
        const ano = peticao.data.getFullYear();
        const inicioAno = new Date(ano, 0, 1);
        const diasDecorridos = Math.floor((peticao.data.getTime() - inicioAno.getTime()) / (24 * 60 * 60 * 1000));
        const semanaDoAno = Math.ceil((diasDecorridos + inicioAno.getDay() + 1) / 7);
        const chaveSemana = `${ano}-W${String(semanaDoAno).padStart(2, '0')}`;
        peticoesPorSemana[chaveSemana] = (peticoesPorSemana[chaveSemana] || 0) + 1;
      }
    });

    const diasAtivos = Object.keys(peticoesPorDia).length;
    const semanasAtivas = Object.keys(peticoesPorSemana).length;
    const totalAnalises = peticoesDoResponsavel.length;

    // Calcula médias
    const mediaDiaria = diasAtivos > 0 ? 
      Math.round((totalAnalises / diasAtivos) * 100) / 100 : 0;
    
    const mediaSemanal = semanasAtivas > 0 ? 
      Math.round((totalAnalises / semanasAtivas) * 100) / 100 : 0;

    return {
      responsavel,
      mediaDiaria,
      mediaSemanal,
      totalAnalises,
      diasAtivos,
      semanasAtivas
    };
  }).sort((a, b) => b.totalAnalises - a.totalAnalises); // Ordena por total de petições
};