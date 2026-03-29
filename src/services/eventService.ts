import { api } from '../api/api';
import { Event } from '../types';

export const eventService = {
  // Busca todos os eventos ativos
  getAll: async (): Promise<Event[]> => {
    const response = await api.get('/events');
    return response.data;
  },

  // Busca detalhes de um evento pelo ID
  getById: async (id: string): Promise<Event> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
  
  // (Opcional - Admin) Deletar evento
  delete: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  }
};