import axios from "axios";

// 1. Configuração da URL base do seu Backend
export const api = axios.create({
  baseURL: "https://localhost:7082", // Sua porta HTTPS padrão do .NET
});

// 2. Interceptor para enviar o Token JWT automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. (Opcional) Interceptor para tratar erros globais (ex: 401 não autorizado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Se o token expirar ou for inválido, limpa e manda pro login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
