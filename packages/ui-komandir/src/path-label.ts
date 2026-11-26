export function shortenPath(value: string, width: number, measure: (text: string) => number): string {
  if (measure(value) <= width) return value;
  const middle = (text: string, prefix = "", suffix = ""): string => {
    const letters = Array.from(text);
    let low = 0;
    let high = Math.max(0, letters.length - 1);
    let result = "…";
    while (low <= high) {
      const count = Math.floor((low + high) / 2);
      const start = Math.ceil(count * 0.4);
      const candidate = `${letters.slice(0, start).join("")}…${count > start ? letters.slice(-(count - start)).join("") : ""}`;
      if (measure(prefix + candidate + suffix) <= width) { result = candidate; low = count + 1; }
      else high = count - 1;
    }
    return result;
  };
  const separator = /^[A-Za-z]:[\\/]|^\\\\/.test(value) && value.includes("\\") ? "\\" : "/";
  const parts = value.split(separator).filter(Boolean);
  const rootParts = value.startsWith(separator + separator) ? 2 : 1;
  if (parts.length < rootParts + 2) return middle(value);
  const root = `${value.startsWith(separator + separator) ? separator + separator : value.startsWith(separator) ? separator : ""}${parts.slice(0, rootParts).join(separator)}`;
  const leaf = parts.at(-1)!;
  for (let idx = rootParts; idx < parts.length - 1; idx += 1) {
    const candidate = `${root}${separator}…${separator}${parts.slice(idx).join(separator)}`;
    if (measure(candidate) <= width) return candidate;
  }
  const prefix = `${root}${separator}…${separator}`;
  if (measure(prefix + leaf) <= width * 0.6) return prefix + middle(parts.at(-2)!, prefix, separator + leaf) + separator + leaf;
  const parent = `${root}${separator}…${separator}${parts.at(-2)}${separator}`;
  if (measure(parent + "…") <= width * 0.7) return parent + middle(leaf, parent);
  if (measure(prefix + "…") <= width * 0.6) return prefix + middle(leaf, prefix);
  return middle(value);
}
