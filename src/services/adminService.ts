import { EventParticipant } from '../types';
import { api } from './../api/api';

class AdminService {
  async getEventParticipants(eventId: string): Promise<EventParticipant[]> {
    if (!eventId) {
      throw new Error("eventId é obrigatório.");
    }

    const response = await api.get<EventParticipant[]>(
      `/admin/events/${eventId}/participants`
    );

    return response.data;
  }

  async exportEventParticipantsPdf(
    eventId: string,
    fileName?: string
  ): Promise<void> {
    if (!eventId) {
      throw new Error("eventId é obrigatório.");
    }

    const response = await api.get(
      `/admin/events/${eventId}/participants/export-pdf`,
      {
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || `participantes-${eventId}.pdf`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  }
}

export const adminService = new AdminService();