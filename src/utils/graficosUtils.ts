import { type Tarefa } from '../types';

// Interface para dados agregados por dia
export interface DadosPorDia {
  date: string;
  qtd: number;
  pontos: number;
}

/**
 * Agrupa tarefas completas por dia baseado na data de conclusão
 * A data está em users[0].completed
 * @param tarefasCompletas - Array de tarefas completas
 * @returns Array de dados agregados por dia ordenados por data
 */
export function agruparTarefasPorDia(tarefasCompletas: Tarefa[]): DadosPorDia[] {
  // Criar um mapa para agrupar por data
  const dadosPorDia = new Map<string, Tarefa[]>();

  // Agrupar tarefas por data
  tarefasCompletas.forEach((tarefa) => {
    // Pegar a data de conclusão do primeiro usuário
    const dataCompleted = tarefa.users && tarefa.users.length > 0 
      ? tarefa.users[0].completed 
      : '';
    
    if (dataCompleted) {
      // Usar regex para extrair apenas YYYY-MM-DD do início da string
      const match = dataCompleted.match(/^\d{4}-\d{2}-\d{2}/);
      const dataFormatada = match ? match[0] : dataCompleted;
      
      // Agrupar tarefas por data
      if (dadosPorDia.has(dataFormatada)) {
        dadosPorDia.get(dataFormatada)!.push(tarefa);
      } else {
        dadosPorDia.set(dataFormatada, [tarefa]);
      }
    }
  });

  // Converter para array usando reduce e ordenar por data
  const resultado: DadosPorDia[] = Array.from(dadosPorDia.entries())
    .map(([date, tarefas]) => ({
      date,
      qtd: tarefas.reduce((acc) => acc + 1, 0),
      pontos: tarefas.reduce((acc, tarefa) => acc + (tarefa.reward || 0), 0)
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
  return resultado;
}

/**
 * Formata uma data YYYY-MM-DD para exibição mais amigável
 * @param dataStr - String da data no formato YYYY-MM-DD
 * @returns Data formatada para exibição (DD/MM)
 */
export function formatarDataParaExibicao(dataStr: string): string {
  try {
    const data = new Date(dataStr + 'T00:00:00'); // Adiciona horário para evitar problemas de timezone
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    return `${dia}/${mes}`;
  } catch {
    return dataStr; // Se falhar, retorna a string original
  }
}

// Interface para dados de média por semana
export interface MediaPorSemana {
  semana: string;
  media: number;
}

/**
 * Calcula a média de pontos por semana baseado na lógica de quebra de semana
 * Uma semana termina quando há uma diferença de 2 ou mais dias entre datas consecutivas
 * @param dadosPorDia - Array de dados agrupados por dia
 * @returns Array de médias por semana
 */
export function calcularMediaPorSemana(dadosPorDia: DadosPorDia[]): MediaPorSemana[] {
  if (dadosPorDia.length === 0) return [];

  // Ordenar por data para garantir ordem cronológica
  const dadosOrdenados = [...dadosPorDia].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const semanas: MediaPorSemana[] = [];
  let semanaAtual: DadosPorDia[] = [];
  let numeroSemana = 1;

  for (let i = 0; i < dadosOrdenados.length; i++) {
    const dadoAtual = dadosOrdenados[i];
    semanaAtual.push(dadoAtual);

    // Verificar se é o último item ou se há quebra de semana
    const isUltimoItem = i === dadosOrdenados.length - 1;
    let temQuebraDeSemanaN = false;

    if (!isUltimoItem) {
      const proximoDado = dadosOrdenados[i + 1];
      const dataAtual = new Date(dadoAtual.date);
      const proximaData = new Date(proximoDado.date);
      
      // Calcular diferença em dias
      const diferencaEmDias = Math.floor(
        (proximaData.getTime() - dataAtual.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Se há diferença de 2 ou mais dias, é quebra de semana
      temQuebraDeSemanaN = diferencaEmDias >= 2;
    }

    // Se é quebra de semana ou último item, calcular média da semana atual
    if (isUltimoItem || temQuebraDeSemanaN) {
      const totalPontos = semanaAtual.reduce((acc, dia) => acc + dia.pontos, 0);
      const totalDias = semanaAtual.length;
      const media = totalDias > 0 ? parseFloat((totalPontos / totalDias).toFixed(2)) : 0;

      semanas.push({
        semana: `Semana ${numeroSemana}`,
        media: media
      });

      // Resetar para próxima semana
      semanaAtual = [];
      numeroSemana++;
    }
  }

  console.log('Semanas calculadas:', semanas);
  return semanas;
}