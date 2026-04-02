// apps/renderer/src/services/utils.services.ts
import { buildTimeline } from "@templates/index";
import { getMediaDurationInSeconds } from "@video-utils/getVideoDuration";
import { config } from "../config";

export async function getVideoDurationInSecondsService(job: any) {
  const testPath = job.inputProps?.testVideoPath;

  if (testPath) {
    const duration = await getMediaDurationInSeconds(testPath);
    return {
      ok: true,
      durationInSeconds: duration,
    };
  }

  return {
    ok: false,
    durationInSeconds: null,
  }; // TEMPORARY — stop before rendering
}

export async function buildTimelineService(job: any) {
  const timeline = await buildTimeline({
    fragments: job.inputProps.fragments,
    intro: {
      src: job.inputProps.intro,
      // durationInFrames: 90, // 3 seconds @ 30fps
    },
    outro: {
      src: job.inputProps.outro,
      // durationInFrames: 90,
    },
    fps: config.fps,
  });

  return {
    ok: true,
    timeline,
  };
}
