export interface SrgbColor { red: number; green: number; blue: number }
export interface OklchColor { lightness: number; chroma: number; hue: number }
export interface DisplayColor extends SrgbColor { inGamut: boolean }

export function parseHexColor(value: string): SrgbColor | null {
  const match = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(value.trim());
  if (!match) return null;
  const hex = match[1]!.length === 3 ? [...match[1]!].map(character => character + character).join("") : match[1]!;
  return { red: parseInt(hex.slice(0, 2), 16), green: parseInt(hex.slice(2, 4), 16), blue: parseInt(hex.slice(4, 6), 16) };
}

export function rgbToHex(color: SrgbColor): string {
  return `#${[color.red, color.green, color.blue].map(channel => Math.round(Math.max(0, Math.min(255, channel))).toString(16).padStart(2, "0")).join("")}`;
}

function toLinear(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function fromLinear(channel: number): number {
  const value = Math.max(0, Math.min(1, channel));
  return 255 * (value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055);
}

export function rgbToOklch(color: SrgbColor): OklchColor {
  const red = toLinear(color.red);
  const green = toLinear(color.green);
  const blue = toLinear(color.blue);
  const long = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const medium = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const short = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);
  const lightness = 0.2104542553 * long + 0.7936177850 * medium - 0.0040720468 * short;
  const redGreen = 1.9779984951 * long - 2.4285922050 * medium + 0.4505937099 * short;
  const yellowBlue = 0.0259040371 * long + 0.7827717662 * medium - 0.8086757660 * short;
  const chroma = Math.hypot(redGreen, yellowBlue);
  return { lightness, chroma, hue: chroma < 0.000001 ? 0 : (Math.atan2(yellowBlue, redGreen) * 180 / Math.PI + 360) % 360 };
}

export function oklchToRgb(color: OklchColor): DisplayColor {
  const radians = color.hue * Math.PI / 180;
  const redGreen = color.chroma * Math.cos(radians);
  const yellowBlue = color.chroma * Math.sin(radians);
  const long = (color.lightness + 0.3963377774 * redGreen + 0.2158037573 * yellowBlue) ** 3;
  const medium = (color.lightness - 0.1055613458 * redGreen - 0.0638541728 * yellowBlue) ** 3;
  const short = (color.lightness - 0.0894841775 * redGreen - 1.2914855480 * yellowBlue) ** 3;
  const red = 4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short;
  const green = -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short;
  const blue = -0.0041960863 * long - 0.7034186147 * medium + 1.7076147010 * short;
  const inGamut = [red, green, blue].every(channel => channel >= -0.000001 && channel <= 1.000001);
  return { red: fromLinear(red), green: fromLinear(green), blue: fromLinear(blue), inGamut };
}
