export function controlNumber(value: number, decimalPlaces = 0) {
  return Number.isFinite(value) ? String(Number(value.toFixed(Math.max(0, Math.min(6, decimalPlaces))))) : "";
}

export function stepDecimalPlaces(step: number) {
  const [mantissa, exponent = "0"] = String(step).toLowerCase().split("e");
  return Math.max(0, Math.min(6, (mantissa.split(".")[1]?.length ?? 0) - Number(exponent)));
}
