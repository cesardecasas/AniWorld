// Return anime season name for a JS month (0 = Jan, 11 = Dec)
export default function getSeason(month: number): string {
  // Spring: Mar (2) - May (4)
  if (month >= 2 && month <= 4) return "spring";
  // Summer: Jun (5) - Aug (7)
  if (month >= 5 && month <= 7) return "summer";
  // Fall: Sep (8) - Nov (10)
  if (month >= 8 && month <= 10) return "fall";
  // Winter: Dec (11), Jan (0), Feb (1)
  return "winter";
}
