import { type Tarefa, type ResumoTarefasPorTipo } from '../types';

/**
 * Agrupa tarefas completas e incompletas por tipo em um único array
 * @param tarefasCompletas - Array de tarefas completas
 * @param tarefasIncompletas - Array de tarefas incompletas
 * @returns Array com resumo de tarefas por tipo
 */
export const agruparTarefasCompletasEIncompletas = (
  tarefasCompletas: Tarefa[],
  tarefasIncompletas: Tarefa[]
): ResumoTarefasPorTipo[] => {
  const agrupamento: Record<string, ResumoTarefasPorTipo> = {};

  // Processar tarefas completas
  tarefasCompletas.forEach((tarefa) => {
    const tipo = tarefa.task || "Sem tipo";
    if (!agrupamento[tipo]) {
      agrupamento[tipo] = {
        tipo,
        completas: 0,
        incompletas: 0,
      };
    }
    agrupamento[tipo].completas++;
  });

  // Processar tarefas incompletas
  tarefasIncompletas.forEach((tarefa) => {
    const tipo = tarefa.task || "Sem tipo";
    if (!agrupamento[tipo]) {
      agrupamento[tipo] = {
        tipo,
        completas: 0,
        incompletas: 0,
      };
    }
    agrupamento[tipo].incompletas++;
  });

  // Converter objeto em array e ordenar por total (decrescente)
  return Object.values(agrupamento).sort(
    (a, b) => b.completas + b.incompletas - (a.completas + a.incompletas)
  );
};