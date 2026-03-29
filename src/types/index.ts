export interface Event {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  price: number;
  description?: string;
  location?: string;
}