export interface EventImage {
  imageUrl: string;
  description?: string;
}

export interface EventOption {
  id: string;
  eventId: string;
  name: string;
  category?: string;
  distanceKm?: number;
  price: number;
  maxSlots?: number;
}

export interface Event {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  description?: string;
  location?: string;
  coverUrl?: string; // Usado na listagem da Home
  organizerId?: string;
  createdAt?: string;
  options?: EventOption[]; // Usado nos detalhes
  images?: EventImage[];   // Usado no carrossel de detalhes
}

export interface EventParticipant {
  registrationId: string;
  userId: string;
  fullName: string;
  email: string;
  cpf: string;
  categoryName: string;
  paymentStatus: string;
  registrationCreatedAt: string;
}
