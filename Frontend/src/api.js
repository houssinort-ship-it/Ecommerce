import axios from 'axios';

// URL de l'API configurable via .env (VITE_API_URL).
// - en développement : http://localhost:4000/api
// - en production : /api (même origine) si VITE_API_URL n'est pas défini.
//   Cela évite qu'un site déployé appelle « localhost », injoignable depuis
//   le navigateur du visiteur. Si le front et l'API sont sur deux domaines
//   différents, définissez VITE_API_URL dans les variables du projet Vercel.
const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:4000/api' : '/api');

const api = axios.create({ baseURL });

// Ajoute le token JWT à chaque requête si l'utilisateur est connecté
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Session expirée / token invalide → on nettoie le stockage local
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
