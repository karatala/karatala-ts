type Language = "en" | "ru";

const datePattern = /^(YYYY|MMM?|DD)([-./ ])(YYYY|MMM?|DD)\2(YYYY|MMM?|DD)$/;
const timestampPattern = /^(.+?) (HH|hh):ii(?::ss)?( A)?$/;
const tokenPattern = /YYYY|MMM?|DD|HH|hh|ii|ss|A|[^A-Za-z]+|[A-Za-z]/g;
const shortMonths = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  ru: ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
} as const satisfies Record<Language, readonly string[]>;
export const DEFAULT_FILE_DATE_FORMAT = "YYYY-MM-DD HH:ii(:ss)";
export const FILE_DATE_FORMAT_ERROR = "Use a format such as DD MMM YYYY HH:ii(:ss) or MM/DD/YYYY hh:ii(:ss) A.";
type Field = "YYYY" | "MM" | "MMM" | "DD" | "HH" | "hh" | "ii" | "ss" | "A";
type Piece = { text: string; field?: Field; dateIdx?: number; muted: boolean };
export interface FormattedFileDate { parts: { text: string; muted: boolean }[]; visible: string; full: string }

export function compileFileDateFormat(value: unknown): Piece[] | null {
  if (typeof value !== "string" || !value.length || value.length > 64 || !/^(?:[^()]+|\([^()]+\))+$/.test(value)) return null;
  const pattern = datePattern.test(value) ? value + " HH:ii(:ss)" : value;
  const plain = pattern.replace(/[()]/g, "");
  const timestamp = timestampPattern.exec(plain);
  if (!timestamp || (timestamp[2] === "hh") !== Boolean(timestamp[3])) return null;
  const date = datePattern.exec(timestamp[1]!);
  if (!date || new Set([date[1], date[3], date[4]].map(field => field === "MMM" ? "MM" : field)).size !== 3) return null;
  const pieces: Piece[] = [];
  let offset = 0;
  let dateIdx = -1;
  for (const group of pattern.match(/\([^()]+\)|[^()]+/g) ?? []) {
    const muted = group.startsWith("(");
    for (const token of (muted ? group.slice(1, -1) : group).match(tokenPattern) ?? []) {
      const field = /^(YYYY|MMM?|DD|HH|hh|ii|ss|A)$/.test(token) ? token as Field : undefined;
      if (!field && /[A-Za-z]/.test(token)) return null;
      if (offset < timestamp[1]!.length && field) dateIdx++;
      // Keep date separators and the date/time separator independently removable.
      for (const text of !field && offset <= timestamp[1]!.length ? [...token] : [token]) {
        pieces.push({ text, field, dateIdx: offset < timestamp[1]!.length ? dateIdx : offset === timestamp[1]!.length ? 3 : undefined, muted });
        offset += text.length;
      }
    }
  }
  return pieces;
}

export function isFileDateFormat(value: unknown): value is string {
  return compileFileDateFormat(value) !== null;
}

export function renderFileDate(value: string | null, today: Date, pieces: readonly Piece[], shorten: boolean, language: Language): FormattedFileDate | null {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  const year = date.getFullYear(), month = date.getMonth(), day = date.getDate(), hour = date.getHours();
  const pad = (number: number) => String(number).padStart(2, "0");
  const values: Record<Field, string> = { YYYY: String(year).padStart(4, "0"), MM: pad(month + 1), MMM: shortMonths[language][month]!, DD: pad(day), HH: pad(hour), hh: pad(hour % 12 || 12), ii: pad(date.getMinutes()), ss: pad(date.getSeconds()), A: hour < 12 ? "AM" : "PM" };
  const sameYear = shorten && year === today.getFullYear();
  const sameMonth = sameYear && month === today.getMonth();
  const sameDay = sameMonth && day === today.getDate();
  let dateMask = 0;
  for (const piece of pieces) {
    if (piece.dateIdx === undefined || !piece.field) continue;
    const hidden = piece.field === "YYYY" ? sameYear : piece.field === "DD" ? sameDay : sameMonth;
    if (!hidden) dateMask |= 1 << piece.dateIdx;
  }
  let visible = "", full = "";
  const parts: FormattedFileDate["parts"] = [];
  for (const piece of pieces) {
    const text = piece.field ? values[piece.field] : piece.text;
    full += text;
    const idx = piece.dateIdx;
    if (idx !== undefined) {
      const nextDateBit = 1 << (idx + 1);
      const keep = piece.field ? dateMask & (1 << idx) : idx === 3 ? dateMask : (dateMask & nextDateBit) && (dateMask & (nextDateBit - 1));
      if (!keep) continue;
    }
    visible += text;
    const previous = parts.at(-1);
    if (previous?.muted === piece.muted) previous.text += text;
    else parts.push({ text, muted: piece.muted });
  }
  return { parts, visible, full };
}
