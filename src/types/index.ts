// Interface para tipagem dos dados de colaboradores
export interface Colaborador {
  id: number;
  name: string;
  email: string;
  cellphone?: string | null;
}

// Interface para dados de petição inicial
export interface PeticaoInicial {
  data?: Date | null;
  respAnalise?: string;
  respPeticao?: string;
  nomeCliente?: string;
  acao?: string;
  localidade?: string;
  fase?: string;
  observacoes?: string;
}

// Interface para dados do usuário nas tarefas
export interface User {
  user_id: number;
  name: string;
  completed: string;
  important: number;
  urgent: number;
}

// Interface para tipagem das tarefas
export interface Tarefa {
  id: number;
  reward: number | null;
  description?: string;
  date?: string;
  task?: string; // Nome do tipo da tarefa
  users: User[];
  // Adicione outros campos conforme a estrutura real da API
}

// Interface para o agrupamento de tarefas por tipo
export interface TarefaPorTipo {
  tipo: string;
  quantidade: number;
  tarefas: Tarefa[];
}

// Interface para o resumo de tarefas por tipo (completas e incompletas)
export interface ResumoTarefasPorTipo {
  tipo: string;
  completas: number;
  incompletas: number;
  pontos?: number; // Opcional, caso queira somar pontos por tipo
}