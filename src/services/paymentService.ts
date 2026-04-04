import { api } from "../api/api";

export const paymentService = {
  async getByRegistration(registrationId: string) {
    const response = await api.get(`/payments/registration/${registrationId}`);
    return response.data;
  },

  async retryByRegistration(registrationId: string) {
    const response = await api.post(`/registrations/${registrationId}/retry-payment`);
    return response.data;
  },
};