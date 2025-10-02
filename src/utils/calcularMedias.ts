import { type Tarefa } from '../types';

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