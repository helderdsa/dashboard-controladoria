import api from './api';
import type { Colaborador } from '../types';

// Serviço de colaboradores
export const advboxApiService = {
  //GET All Tasks
  getTodasTarefas: async (userName: string) => {
    const pendentes = await api.get(`/posts?date_start=2025-09-01&date_end=2025-09-30&user_name=${userName}`);
    const completas = await api.get(`/posts?completed_start=2025-09-01&completed_end=2025-09-30&user_name=${userName}`);

    // console.log(pendentes.data.data);
    // console.log(completas.data.data);
    
    return {pendentes: pendentes.data.data, completas: completas.data.data};
  },

  // GET - Buscar todos os colaboradores
  getAll: async (): Promise<Colaborador[]> => {
    const response = await api.get('/settings');
    return response.data.users;
  },
};
