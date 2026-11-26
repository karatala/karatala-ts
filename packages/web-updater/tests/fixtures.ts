import { createHash } from "node:crypto";
import { deflateRawSync } from "node:zlib";
import type { AvailableUpdate, WebBuild, WebUpdate } from "../src/core";

export const source = { repository: "example/editor", manifestName: "web-update.json", archiveName: "web-update.zip" };
export const builtin: WebBuild = { appId: "org.example.editor", runtime: "a".repeat(64), revision: "1".repeat(40), sequence: 100, version: "v1" };
export const newer: WebBuild = { ...builtin, revision: "2".repeat(40), sequence: 200, version: "v2" };
export const newest: WebBuild = { ...builtin, revision: "3".repeat(40), sequence: 300, version: "v3" };
export const sha256 = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
export interface ZipEntry { name: string; data: string; deflated?: boolean; attributes?: number; }

function checksum(bytes: Uint8Array) {
  let value = 0xffffffff;
  for (const byte of bytes) {
    value ^= byte;
    for (let idx = 0; idx < 8; idx++) value = value & 1 ? value >>> 1 ^ 0xedb88320 : value >>> 1;
  }
  return (value ^ 0xffffffff) >>> 0;
}

// Independent standard ZIP fixture with real local headers, CRC-32 and central directory.
export function zipFixture(entries: ZipEntry[]) {
  const local: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name);
    const data = Buffer.from(entry.data);
    const compressed = entry.deflated ? deflateRawSync(data) : data;
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0x800, 6);
    header.writeUInt16LE(entry.deflated ? 8 : 0, 8);
    header.writeUInt32LE(checksum(data), 14);
    header.writeUInt32LE(compressed.length, 18);
    header.writeUInt32LE(data.length, 22);
    header.writeUInt16LE(name.length, 26);
    const directory = Buffer.alloc(46);
    directory.writeUInt32LE(0x02014b50, 0);
    directory.writeUInt16LE(3 << 8 | 20, 4);
    directory.writeUInt16LE(20, 6);
    directory.writeUInt16LE(0x800, 8);
    directory.writeUInt16LE(entry.deflated ? 8 : 0, 10);
    directory.writeUInt32LE(checksum(data), 16);
    directory.writeUInt32LE(compressed.length, 20);
    directory.writeUInt32LE(data.length, 24);
    directory.writeUInt16LE(name.length, 28);
    directory.writeUInt32LE(entry.attributes ?? 0x81a40000, 38);
    directory.writeUInt32LE(offset, 42);
    local.push(header, name, compressed);
    central.push(directory, name);
    offset += header.length + name.length + compressed.length;
  }
  const footer = Buffer.alloc(22);
  footer.writeUInt32LE(0x06054b50, 0);
  footer.writeUInt16LE(entries.length, 8);
  footer.writeUInt16LE(entries.length, 10);
  footer.writeUInt32LE(Buffer.concat(central).length, 12);
  footer.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, ...central, footer]);
}

export function bundleFixture(build: WebBuild = newer, extra: ZipEntry[] = []) {
  const archive = zipFixture([{ name: "index.html", data: `<html>${build.version}</html>`, deflated: true }, { name: "app-build.json", data: JSON.stringify(build) }, { name: "assets/main.js", data: `console.log('${build.version}')`, deflated: true }, ...extra]);
  const manifest: WebUpdate = { ...build, format: 1, archive: { name: source.archiveName, size: archive.length, sha256: sha256(archive) } };
  const url = `https://github.com/${source.repository}/releases/download/${build.version}/${source.archiveName}`;
  const update: AvailableUpdate = { manifest, url, releaseUrl: `https://github.com/${source.repository}/releases/tag/${build.version}` };
  return { archive, manifest, update };
}

export function releaseFixture(manifest: WebUpdate = bundleFixture().manifest) {
  const prefix = `https://github.com/${source.repository}/releases/download/${manifest.version}/`;
  return { draft: false, prerelease: false, tag_name: manifest.version, assets: [
    { name: source.manifestName, browser_download_url: prefix + source.manifestName, size: JSON.stringify(manifest).length },
    { name: source.archiveName, browser_download_url: prefix + source.archiveName, size: manifest.archive.size, digest: `sha256:${manifest.archive.sha256}` }
  ] };
}
