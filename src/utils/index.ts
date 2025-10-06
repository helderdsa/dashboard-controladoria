// Exportar todas as funções utilitárias de um só lugar
export { agruparTarefasCompletasEIncompletas } from './tarefasUtils';
export { calcularMediaDiaria, calcularMediaSemanalMensal } from './calcularMedias';
export { 
  agruparTarefasPorDia, 
  formatarDataParaExibicao, 
  calcularMediaPorSemana,
  type DadosPorDia,
  type MediaPorSemana 
} from './graficosUtils';