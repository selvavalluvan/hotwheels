export interface IdentifiedCar {
  car_name: string;
  collection_name: string | null;
  collection_number: string | null; // raw, e.g. "21/250"
  collection_index: number | null;
  collection_total: number | null;
  color: string | null;
  is_gold: boolean;
  confidence: "high" | "medium" | "low";
}

export interface HotwheelsRow {
  id: string;
  car_name: string;
  collection_name: string | null;
  collection_number: string | null;
  collection_index: number | null;
  collection_total: number | null;
  color: string | null;
  is_gold: boolean;
  notes: string | null;
  image_url: string | null;
  created_at: string;
}
