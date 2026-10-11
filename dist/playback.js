// One step is committed atomically: geometry, labels, headers and state agree.
export const STEP_INTERVAL = 1000;

export function stepPoint(scene, step) {
  if (step.router) return [0, .35, 1.05];
  if (step.bridge || step.link) return [scene.hosts[step.host ?? 1] / 2, .12, 1.14];
  return [scene.hosts[step.host], scene.layerY(step.layer) + .22, .86];
}

export function advanceClock(elapsed, delta) {
  const total = elapsed + Math.max(0, delta);
  return {steps: Math.floor(total / STEP_INTERVAL), elapsed: total % STEP_INTERVAL};
}
