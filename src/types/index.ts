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
  coverUrl?: string;
  imageUrl?: string;
  organizerId?: string;
  createdAt?: string;
  options?: EventOption[];
  images?: EventImage[];
}
