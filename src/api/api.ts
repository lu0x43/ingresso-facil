import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "react-hot-toast";

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  throw new Error("VITE_API_URL não configurada");
}

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

declare module "axios" {
  export interface AxiosRequestConfig {
    showErrorToast?: boolean;
  }

  export interface InternalAxiosRequestConfig {
    showErrorToast?: boolean;
  }
}

const getErrorMessage = (error: AxiosError<ApiErrorResponse>): string => {
  const apiMessage = error.response?.data?.error || error.response?.data?.message;

  if (apiMessage && apiMessage.trim()) {
    return apiMessage;
  }

  if (error.code === "ECONNABORTED") {
    return "A requisição demorou demais para responder.";
  }

  if (!error.response) {
    return "Não foi possível se comunicar com o servidor.";
  }

  switch (error.response.status) {
    case 400:
      return "Requisição inválida.";
    case 401:
      return "Sua sessão expirou. Faça login novamente.";
    case 403:
      return "Você não tem permissão para executar esta ação.";
    case 404:
      return "Recurso não encontrado.";
    case 409:
      return "Já existe um registro com esses dados.";
    case 500:
      return "Erro interno do servidor.";
    default:
      return "Ocorreu um erro inesperado.";
  }
};

export const api = axios.create({
  baseURL,
  timeout: 10000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");

  if (token && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.showErrorToast === undefined) {
    config.showErrorToast = true;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      const status = error.response?.status;
      const shouldShowToast = error.config?.showErrorToast !== false;

      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.dispatchEvent(new CustomEvent("auth-expired"));
        window.dispatchEvent(new CustomEvent("auth-changed"));
      }

      if (shouldShowToast && status !== 401) {
        toast.error(getErrorMessage(error));
      }
    } else {
      toast.error("Erro inesperado.");
    }

    return Promise.reject(error);
  }
);