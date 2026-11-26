export const ICON_SVG_ROOT_ID = "komandir-svg-icon-reference-root";

export function iconSvgReferenceUrl(url: string): string {
  const source = url.split("#", 1)[0]!;
  return `${source}${source.includes("?") ? "&" : "?"}use=2#${ICON_SVG_ROOT_ID}`;
}

// The caller supplies a validated passive SVG and its server-derived intrinsic bounds.
// Normalize only the display root size: relative lengths such as 1em must not shrink inside the wrapper.
export function iconSvgReferenceDocument(bytes: Uint8Array, viewBox: string): Uint8Array {
  const source = new TextDecoder().decode(bytes).replace(/^\s*<\?xml\s+[^?<>]*\?>\s*/, "");
  const bounds = viewBox.split(" ");
  const dimensions = `width:${bounds[2]}px!important;height:${bounds[3]}px!important`;
  const embedded = source.replace(/^(\s*(?:<!--[\s\S]*?-->\s*)*)<svg\b((?:"[^"]*"|'[^']*'|[^'">])*)>/, (_root, prefix: string, attributes: string) => {
    let hasStyle = false;
    const normalized = attributes.replace(/\s+([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g, (attribute, name: string, doubleQuoted: string | undefined, singleQuoted: string | undefined) => {
      if (name === "width" || name === "height") return "";
      if (name !== "style") return attribute;
      hasStyle = true;
      const quote = doubleQuoted === undefined ? "'" : '"';
      return ` style=${quote}${doubleQuoted ?? singleQuoted};${dimensions}${quote}`;
    });
    const closing = normalized.trimEnd().endsWith("/") ? "/" : "";
    const retained = closing ? normalized.trimEnd().slice(0, -1) : normalized;
    return `${prefix}<svg${retained} width="${bounds[2]}" height="${bounds[3]}"${hasStyle ? "" : ` style="${dimensions}"`}${closing}>`;
  });
  return new TextEncoder().encode(`<svg xmlns="http://www.w3.org/2000/svg" id="${ICON_SVG_ROOT_ID}" viewBox="${viewBox}" width="${bounds[2]}" height="${bounds[3]}">${embedded}</svg>`);
}
