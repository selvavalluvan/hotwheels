const SWATCHES: Record<string, string> = {
  white: "#ffffff",
  black: "#1a1a1a",
  red: "#E3000F",
  blue: "#1565E8",
  green: "#16A34A",
  yellow: "#FFCC00",
  gold: "#D4A017",
  orange: "#F59E0B",
  purple: "#7C3AED",
  pink: "#EC4899",
  silver: "#C0C0C8",
  gray: "#9CA3AF",
  grey: "#9CA3AF",
  brown: "#92400E",
  chrome: "#C0C0C8",
};

export function colorToHex(color: string | null | undefined): string {
  if (!color) return "#A1A1AA";
  const key = color.trim().toLowerCase().split(/\s+/)[0];
  return SWATCHES[key] ?? "#A1A1AA";
}
