export interface Review {
  customerName: string;
  tripCode: string | null;
  rating: number;
  text: string;
  photoUrl: string | null;
  approved: boolean;
  createdAt: string;
}

export interface ReviewDoc extends Review {
  id: string;
  tripNameTH?: string | null;
}
