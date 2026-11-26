import { crc32, inflateRawSync } from "node:zlib";

export function updatePath(name: string) {
  if (!name || name.length > 512 || name.split("/").some(part => !part || part === "." || part === ".." || /[\\:\x00-\x1f<>"|?*]/.test(part) || /[. ]$/.test(part) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i.test(part))) throw new Error("The update contains an invalid file name. Keep the installed version and use another release.");
  return name;
}

// Read standard single-volume ZIP files only, after the caller verifies the archive SHA-256.
export function unpackWebUpdate(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let footer = bytes.length - 22;
  for (; footer >= Math.max(0, bytes.length - 65557); footer--) if (view.getUint32(footer, true) === 0x06054b50 && footer + 22 + view.getUint16(footer + 20, true) === bytes.length) break;
  const invalid = () => new Error("Cannot open the update archive. Keep the installed version and download a new release.");
  if (footer < 0 || footer < Math.max(0, bytes.length - 65557) || view.getUint16(footer + 4, true) !== 0 || view.getUint16(footer + 6, true) !== 0) throw invalid();
  const count = view.getUint16(footer + 10, true);
  let cursor = view.getUint32(footer + 16, true);
  const end = cursor + view.getUint32(footer + 12, true);
  if (!count || count > 10000 || count !== view.getUint16(footer + 8, true) || end !== footer) throw invalid();
  const files = new Map<string, Uint8Array>();
  const names = new Set<string>();
  let total = 0;
  for (let idx = 0; idx < count; idx++) {
    if (cursor + 46 > end || view.getUint32(cursor, true) !== 0x02014b50) throw invalid();
    const flags = view.getUint16(cursor + 8, true);
    const method = view.getUint16(cursor + 10, true);
    const checksum = view.getUint32(cursor + 16, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const size = view.getUint32(cursor + 24, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const attributes = view.getUint32(cursor + 38, true);
    const local = view.getUint32(cursor + 42, true);
    const next = cursor + 46 + nameLength + extraLength + commentLength;
    if (next > end || flags & 1 || ![0, 8].includes(method) || (attributes >>> 16 & 0xf000) === 0xa000 || view.getUint16(cursor + 34, true) !== 0) throw invalid();
    const name = new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(cursor + 46, cursor + 46 + nameLength));
    cursor = next;
    if (name.endsWith("/")) { updatePath(name.slice(0, -1)); if (size !== 0) throw invalid(); continue; }
    updatePath(name);
    const folded = name.toLowerCase();
    if (names.has(folded)) throw invalid();
    names.add(folded);
    total += size;
    if (total > 256 * 1024 * 1024 || local + 30 > end || view.getUint32(local, true) !== 0x04034b50 || view.getUint16(local + 8, true) !== method) throw invalid();
    const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
    if (start + compressedSize > end || start < local + 30) throw invalid();
    const compressed = bytes.subarray(start, start + compressedSize);
    let data: Uint8Array;
    try { data = method === 0 ? compressed : inflateRawSync(compressed, { maxOutputLength: Math.max(1, size) }); }
    catch { throw invalid(); }
    if (data.length !== size || crc32(data) !== checksum) throw invalid();
    files.set(name, data);
  }
  if (cursor !== end || !files.has("index.html") || !files.has("app-build.json")) throw invalid();
  for (const name of files.keys()) {
    const parts = name.split("/");
    parts.pop();
    while (parts.length) { if (names.has(parts.join("/").toLowerCase())) throw invalid(); parts.pop(); }
  }
  return files;
}
