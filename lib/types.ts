export interface IdentifiedCar {
  car_name: string;
  collection_name: string | null;
  collection_number: string | null; // raw, e.g. "244/250" (overall card number)
  collection_index: number | null;
  collection_total: number | null;
  series_number: string | null; // raw, e.g. "2/10" (position within the named series/collection)
  series_index: number | null;
  series_total: number | null;
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
  series_number: string | null;
  series_index: number | null;
  series_total: number | null;
  color: string | null;
  is_gold: boolean;
  notes: string | null;
  image_url: string | null;
  created_at: string;
}
