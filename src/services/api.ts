import axios from 'axios';

// Crie uma instância do axios com configurações padrão
const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, // Altere para a URL da sua API
  timeout: 10000, // Timeout de 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requisições (útil para adicionar tokens de autenticação)
api.interceptors.request.use(
  (config) => {
    config.headers.Authorization = `Bearer ${import.meta.env.VITE_API_KEY}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para respostas (útil para tratamento global de erros)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Tratamento global de erros
    if (error.response) {
      // O servidor respondeu com um status code fora do range 2xx
      console.error('Erro na resposta:', error.response.data);
      console.error('Status:', error.response.status);
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('Erro na requisição:', error.request);
    } else {
      // Algo aconteceu ao configurar a requisição
      console.error('Erro:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
