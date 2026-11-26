export type BrowserFileHandle = {
  kind: "file";
  name: string;
  getFile(): Promise<File>;
  queryPermission(options: { mode: "read" }): Promise<PermissionState>;
  requestPermission(options: { mode: "read" }): Promise<PermissionState>;
};
export type BrowserPickedFile = { file: File; handle?: BrowserFileHandle };
export interface BrowserPickerOptions { multiple: boolean; types: { description: string; accept: Record<string, string[]> }[] }
type FilePicker = (options: BrowserPickerOptions) => Promise<BrowserFileHandle[]>;

export async function pickBrowserFiles(options: BrowserPickerOptions): Promise<BrowserPickedFile[] | null> {
  const picker = (window as Window & { showOpenFilePicker?: FilePicker }).showOpenFilePicker;
  if (!picker) return null;
  const handles = await picker.call(window, options);
  return Promise.all(handles.map(async handle => ({ file: await handle.getFile(), handle })));
}

export async function droppedBrowserFiles(data: DataTransfer): Promise<BrowserPickedFile[]> {
  // Capture files and request handles in the drop event, before its data store closes.
  const requests = Array.from(data.items).filter(item => item.kind === "file").map(item => {
    const file = item.getAsFile();
    const entry = item as DataTransferItem & { getAsFileSystemHandle?: () => Promise<BrowserFileHandle | { kind: "directory" } | null> };
    const handle = entry.getAsFileSystemHandle?.().catch(() => null);
    return { file, handle };
  });
  if (!requests.length) return Array.from(data.files, file => ({ file }));
  const files = await Promise.all(requests.map(async entry => {
    const handle = await entry.handle;
    return entry.file ? { file: entry.file, ...(handle?.kind === "file" ? { handle } : {}) } : null;
  }));
  return files.filter((entry): entry is BrowserPickedFile => entry !== null);
}
