export interface EventOption {
  id: string;
  name: string;
  category?: string;
  distanceKm?: number;
  price: number;
}

export interface Event {
  id: string;
  title: string;
  startDate: string;
  endDate: string;

  price: number;

  description?: string;
  location?: string;
  imageUrl?: string;
  availableSpots?: number;
  isActive?: boolean;

  options?: EventOption[];
}