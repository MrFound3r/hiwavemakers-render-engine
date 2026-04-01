// apps/renderer/src/services/render.services.ts
import { activeRenders } from "../jobs/render.jobs";

export function cancelRender(jobId: string) {
  const active = activeRenders.get(jobId);

  if (active) {
    active.cancel();
    return true;
  }

  return false;
}
