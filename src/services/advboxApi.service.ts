import api from './api';

// Interface para tipagem dos dados de colaboradores
export interface Colaborador {
  id: number;
  name: string;
  email: string;
  cellphone?: string | null;
}

// Interface para tipagem das tarefas
export interface Tarefa {
  id: number;
  title: string;
  description?: string;
  date?: string;
  completed_at?: string;
  status?: string;
  // Adicione outros campos conforme a estrutura real da API
}

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

  // // GET - Buscar um colaborador por ID
  // getById: async (id: number): Promise<Colaborador> => {
  //   const response = await api.get<Colaborador>(`/colaboradores/${id}`);
  //   return response.data;
  // },

  // // POST - Criar um novo colaborador
  // create: async (data: Omit<Colaborador, 'id'>): Promise<Colaborador> => {
  //   const response = await api.post<Colaborador>('/colaboradores', data);
  //   return response.data;
  // },

  // // PUT - Atualizar um colaborador
  // update: async (id: number, data: Partial<Colaborador>): Promise<Colaborador> => {
  //   const response = await api.put<Colaborador>(`/colaboradores/${id}`, data);
  //   return response.data;
  // },

  // // DELETE - Deletar um colaborador
  // delete: async (id: number): Promise<void> => {
  //   await api.delete(`/colaboradores/${id}`);
  // },
};
