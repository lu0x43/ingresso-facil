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
  imageUrl?: string;
  availableSpots?: number;
  isActive?: boolean;
  options?: EventOption[];
}