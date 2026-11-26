export function createDragMomentum(ownerWindow: Window, move: (horizontal: number, vertical: number) => boolean) {
  let frame: number | null = null;
  let previousTime = 0;
  let sampleTime = 0;
  let velocityX = 0;
  let velocityY = 0;
  function stop() {
    if (frame !== null) ownerWindow.cancelAnimationFrame(frame);
    frame = null;
    velocityX = 0;
    velocityY = 0;
  }
  function begin() { stop(); sampleTime = ownerWindow.performance.now(); }
  function sample(horizontal: number, vertical: number) {
    if (!horizontal && !vertical) return;
    const now = ownerWindow.performance.now();
    const elapsed = Math.max(1, now - sampleTime);
    const retained = elapsed < 80 ? 0.35 : 0;
    velocityX = velocityX * retained + Math.max(-6, Math.min(6, horizontal / elapsed)) * (1 - retained);
    velocityY = velocityY * retained + Math.max(-6, Math.min(6, vertical / elapsed)) * (1 - retained);
    sampleTime = now;
  }
  function animate(now: number) {
    frame = null;
    const elapsed = Math.min(64, Math.max(0, now - previousTime));
    previousTime = now;
    const decay = Math.exp(-elapsed / 250);
    velocityX *= decay;
    velocityY *= decay;
    if (Math.hypot(velocityX, velocityY) < 0.02 || !move(velocityX * elapsed, velocityY * elapsed)) { stop(); return; }
    frame = ownerWindow.requestAnimationFrame(animate);
  }
  function release() {
    previousTime = ownerWindow.performance.now();
    if (previousTime - sampleTime > 80 || Math.hypot(velocityX, velocityY) < 0.02) { stop(); return; }
    frame = ownerWindow.requestAnimationFrame(animate);
  }
  return { begin, sample, release, stop };
}
