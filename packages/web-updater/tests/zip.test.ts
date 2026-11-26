import { expect, test } from "bun:test";
import { unpackWebUpdate } from "../src/zip";
import { builtin, bundleFixture, zipFixture } from "./fixtures";

test("standard stored and deflated ZIP members retain their exact bytes", () => {
  const fixture = bundleFixture(builtin);
  const files = unpackWebUpdate(fixture.archive);
  expect(new TextDecoder().decode(files.get("index.html"))).toBe("<html>v1</html>");
  expect(JSON.parse(new TextDecoder().decode(files.get("app-build.json")))).toEqual(builtin);
  expect(new TextDecoder().decode(files.get("assets/main.js"))).toBe("console.log('v1')");
});

test("truncated ZIP directories are rejected", () => {
  const archive = bundleFixture().archive;
  expect(() => unpackWebUpdate(archive.subarray(0, archive.length - 7))).toThrow("Cannot open");
});

test.each(["../outside.js", "/absolute.js", "C:/outside.js", "assets/CON.txt", "assets/code.js "])("unsafe archive paths are rejected: %s", name => {
  expect(() => unpackWebUpdate(bundleFixture(builtin, [{ name, data: "outside" }]).archive)).toThrow("invalid file name");
});

test("symbolic links, case collisions and file/directory collisions are rejected", () => {
  expect(() => unpackWebUpdate(bundleFixture(builtin, [{ name: "link", data: "outside", attributes: 0xa1ff0000 }]).archive)).toThrow("Cannot open");
  expect(() => unpackWebUpdate(bundleFixture(builtin, [{ name: "INDEX.HTML", data: "duplicate" }]).archive)).toThrow("Cannot open");
  expect(() => unpackWebUpdate(bundleFixture(builtin, [{ name: "assets", data: "file" }]).archive)).toThrow("Cannot open");
});

test("a claimed oversized extraction is rejected before allocating its output", () => {
  const archive = bundleFixture().archive;
  const central = archive.readUInt32LE(archive.length - 6);
  archive.writeUInt32LE(256 * 1024 * 1024 + 1, central + 24);
  expect(() => unpackWebUpdate(archive)).toThrow("Cannot open");
});

test("a damaged member is rejected even if the surrounding ZIP structure is intact", () => {
  const archive = zipFixture([{ name: "index.html", data: "<html>original</html>" }, { name: "app-build.json", data: JSON.stringify(builtin) }]);
  archive[30 + Buffer.byteLength("index.html") + 6]! ^= 1;
  expect(() => unpackWebUpdate(archive)).toThrow("Cannot open");
});

test("a damaged deflate stream returns an archive error instead of a decoder diagnostic", () => {
  const archive = bundleFixture().archive;
  archive[30 + Buffer.byteLength("index.html")] = 0xff;
  expect(() => unpackWebUpdate(archive)).toThrow("Cannot open the update archive");
});
