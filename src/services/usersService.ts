import { api } from "../api/api";

export type MeResponse = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export type MyRegistration = {
  registrationId: string;
  eventId: string;
  eventOptionId: string;
  eventTitle: string;
  status: string;
  eventDate: string;
  createdAt: string;
  option: {
    name: string;
    category?: string;
    distanceKm?: number;
    price: number;
  };
};

export const usersService = {
  async getMe(): Promise<MeResponse> {
    const response = await api.get("/users/me");
    return response.data;
  },

  async getMyRegistrations(): Promise<MyRegistration[]> {
    const response = await api.get("/users/me/registrations");
    return response.data;
  },
};