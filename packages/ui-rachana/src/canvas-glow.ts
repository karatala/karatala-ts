export function canvasGlowStrength(style: CSSStyleDeclaration) {
  const strength = Number.parseFloat(style.getPropertyValue("--ui-glow-strength"));
  return Number.isFinite(strength) ? Math.max(0, strength) : 1;
}
