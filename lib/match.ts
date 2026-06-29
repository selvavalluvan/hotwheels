export function normalize(s: string | null | undefined) {
  return (s ?? "").trim().toLowerCase();
}

interface Comparable {
  car_name: string;
  collection_name: string | null;
  collection_number: string | null;
  series_number: string | null;
  color: string | null;
  is_gold: boolean;
}

export function isSameCar(a: Comparable, b: Comparable) {
  return (
    normalize(a.car_name) === normalize(b.car_name) &&
    normalize(a.collection_name) === normalize(b.collection_name) &&
    normalize(a.collection_number) === normalize(b.collection_number) &&
    normalize(a.series_number) === normalize(b.series_number) &&
    normalize(a.color) === normalize(b.color) &&
    !!a.is_gold === !!b.is_gold
  );
}
