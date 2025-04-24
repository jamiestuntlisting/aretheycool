interface Rating {
  id: number;
  score: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Actor {
  id: number;
  name: string;
  imdbUrl: string;
  rating: number;
  latestNote: string;
  latestRating: number;
  timestamp: string;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  ratings: Rating[];
} 