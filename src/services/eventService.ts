import { api } from "../api/api";
import { Event, EventOption } from "../types";

type UpdateEventPayload = {
  title: string;
  description: string | null;
  location: string | null;
  startDate: string;
  endDate: string;
};

type CreateOptionPayload = {
  eventId: string;
  name: string;
  category: string;
  distanceKm: number;
  price: number;
  maxSlots: number;
};

type UpdateOptionPayload = {
  name: string;
  category: string;
  distanceKm: number;
  price: number;
  maxSlots: number;
};

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

  update: async (id: string, data: UpdateEventPayload) => {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  },

  createOption: async (data: CreateOptionPayload) => {
    const response = await api.post("/event-options", data);
    return response.data;
  },

  updateOption: async (id: string, data: UpdateOptionPayload) => {
    const response = await api.put(`/event-options/${id}`, data);
    return response.data;
  },

  deleteOption: async (id: string) => {
    const response = await api.delete(`/event-options/${id}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },
};