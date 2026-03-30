import { api } from "../api/api";
import { Event, EventOption } from "../types";

export const eventService = {
  getAll: async (): Promise<Event[]> => {
    const response = await api.get("/events");
    return response.data;
  },

  getById: async (id: string): Promise<Event> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  getOptionsByEvent: async (eventId: string): Promise<EventOption[]> => {
    const response = await api.get(`/event-options/event/${eventId}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },
};