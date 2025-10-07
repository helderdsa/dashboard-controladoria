import api from './api';
import type { Colaborador, Tarefa } from '../types';

// Função auxiliar para buscar todas as tarefas com paginação
const buscarTodasTarefasComPaginacao = async (endpoint: string): Promise<Tarefa[]> => {
  const todasTarefas: Tarefa[] = [];
  let offset = 0;
  const limite = 1000;
  let tentativa = 1;
  
  
  while (true) {

    
    try {
      const url = `${endpoint}&offset=${offset}`;

      const response = await api.get(url);
      const tarefas = response.data.data;
      
      if (!tarefas || tarefas.length === 0) {
        
        break; // Não há mais tarefas para buscar
      }
      
      todasTarefas.push(...tarefas);
      
      
      // Se retornou menos que o limite, chegamos ao fim
      if (tarefas.length < limite) {
        break;
      }
      
      offset += limite;
      tentativa++;
      
    } catch (error) {
      console.error(`❌ Erro na tentativa ${tentativa}:`, error);
      throw error;
    }
  }
  
  return todasTarefas;
};

// Serviço de colaboradores
export const advboxApiService = {
  //GET All Tasks com paginação automática
  getTodasTarefas: async (userName: string, ano: string, mes: string) => {

    const endpointPendentes = `/posts?date_start=${ano}-${mes}-01&date_end=${ano}-${mes}-30&user_name=${userName}`;
    const endpointCompletas = `/posts?completed_start=${ano}-${mes}-01&completed_end=${ano}-${mes}-30&user_name=${userName}`;

    const [pendentes, completas] = await Promise.all([
      buscarTodasTarefasComPaginacao(endpointPendentes),
      buscarTodasTarefasComPaginacao(endpointCompletas)
    ]);
    

    const pontosAcumulados = completas.reduce((acc, tarefa) => acc + (tarefa.reward || 0), 0);

    return { pendentes, completas, pontosAcumulados };
  },

  // GET - Buscar todos os colaboradores
  getAll: async (): Promise<Colaborador[]> => {
    const response = await api.get('/settings');
    return response.data.users;
  },
};
