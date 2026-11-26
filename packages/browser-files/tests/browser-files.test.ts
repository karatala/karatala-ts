import { afterEach, beforeEach, expect, test } from "bun:test";
import { droppedBrowserFiles, pickBrowserFiles, type BrowserFileHandle } from "../src/index";

let previousWindow: PropertyDescriptor | undefined;
beforeEach(() => {
  previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { value: {}, configurable: true });
});
afterEach(() => {
  if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
  else Reflect.deleteProperty(globalThis, "window");
});
function handle(file: File): BrowserFileHandle {
  return { kind: "file", name: file.name, getFile: async () => file, queryPermission: async () => "granted", requestPermission: async () => "granted" };
}
const options = { multiple: false, types: [{ description: "Documents", accept: { "text/plain": [".txt"] } }] };

test("unsupported selection returns null without opening a fallback or requesting permission", async () => {
  expect(await pickBrowserFiles(options)).toBeNull();
});
test("picker receives caller filters and receiver and retains each file handle", async () => {
  const file = new File(["text"], "notes.txt");
  const selected = handle(file);
  let received: unknown;
  let receiver: unknown;
  Object.assign(window, { showOpenFilePicker: async function (input: unknown) { received = input; receiver = this; return [selected]; } });
  expect(await pickBrowserFiles(options)).toEqual([{ file, handle: selected }]);
  expect(received).toBe(options);
  expect(receiver).toBe(window);
});
test("native cancellation stays distinct from an unsupported picker", async () => {
  const cancelled = new DOMException("Cancelled", "AbortError");
  Object.assign(window, { showOpenFilePicker: async () => { throw cancelled; } });
  await expect(pickBrowserFiles(options)).rejects.toBe(cancelled);
});
test("file-read errors are not reported as cancelled or unsupported", async () => {
  const selected = handle(new File([], "gone.txt"));
  selected.getFile = async () => { throw new Error("Cannot read gone.txt"); };
  Object.assign(window, { showOpenFilePicker: async () => [selected] });
  await expect(pickBrowserFiles(options)).rejects.toThrow("gone.txt");
});
test("drop captures files and handle promises before the event data store closes", async () => {
  const file = new File(["content"], "drop.txt");
  const selected = handle(file);
  let open = true;
  let resolveHandle!: (value: BrowserFileHandle) => void;
  const pendingHandle = new Promise<BrowserFileHandle>(resolve => { resolveHandle = resolve; });
  const data = { items: [{ kind: "file", getAsFile() { if (!open) throw new Error("Closed data store"); return file; }, getAsFileSystemHandle() { if (!open) throw new Error("Closed data store"); return pendingHandle; } }], files: [] } as unknown as DataTransfer;
  const pending = droppedBrowserFiles(data);
  open = false;
  resolveHandle(selected);
  expect(await pending).toEqual([{ file, handle: selected }]);
});
test("a denied handle falls back to the captured file", async () => {
  const file = new File([], "fallback.txt");
  const data = { items: [{ kind: "file", getAsFile: () => file, getAsFileSystemHandle: async () => { throw new Error("Denied"); } }], files: [] } as unknown as DataTransfer;
  expect(await droppedBrowserFiles(data)).toEqual([{ file }]);
});
test("directory handles and non-file items never become authorized file paths", async () => {
  const data = { items: [{ kind: "string" }, { kind: "file", getAsFile: () => null, getAsFileSystemHandle: async () => ({ kind: "directory" }) }], files: [] } as unknown as DataTransfer;
  expect(await droppedBrowserFiles(data)).toEqual([]);
});
test("legacy drops use data.files when there are no file items", async () => {
  const file = new File([], "legacy.txt");
  const data = { items: [], files: [file] } as unknown as DataTransfer;
  expect(await droppedBrowserFiles(data)).toEqual([{ file }]);
});
