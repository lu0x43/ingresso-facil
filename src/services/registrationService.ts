// src/services/registrationService.ts

import { api } from "../api/api";

export interface CreateRegistrationPayload {
  eventId: string;
  eventOptionId: string;
  fullName: string;
  email: string;
  acceptedTerms: boolean;
  gender?: string;
  birthDate?: string;
  guardianName?: string;
  address?: string;
  city?: string;
  phone?: string;
  isFit?: boolean;
  shirtSize?: string;
}

export interface CreateRegistrationResponse {
  message: string;
  registrationId: string;
  amount: number;
  pixData: {
    paymentId: string;
    status: string;
    qrCode: string;
    qrCodeBase64: string;
  };
}

export const registrationService = {
  async create(data: CreateRegistrationPayload): Promise<CreateRegistrationResponse> {
    const response = await api.post("/registrations", data);
    return response.data;
  }
};