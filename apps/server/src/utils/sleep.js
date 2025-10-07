export function sleep(durationMs) {
  const timeout = Number.isFinite(durationMs) && durationMs > 0 ? durationMs : 0;
  return new Promise((resolve) => setTimeout(resolve, timeout));
}
