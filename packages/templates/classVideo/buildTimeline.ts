import dotenv from "dotenv";
import { Timeline, TimelineItem } from "../types";
import { getMediaDurationInSeconds } from "@hiwave/video-utils";

dotenv.config();

const INTRO_DURATION_SECONDS = parseInt(process.env.INTRO_DURATION_SECONDS || "3", 10);

type BuildTimelineInput = {
  fragments: {
    id: string;
    src: string;
    order: number;
  }[];
  intro: {
    src?: string;
    durationInFrames?: number;
  };
  outro: {
    src?: string | null;
    durationInFrames?: number;
  };
  fps: number;
  timelapse?: {
    enabled: boolean;
    speed: number;
    fragmentIds?: string[];
  };
};

export async function buildTimeline(input: BuildTimelineInput): Promise<Timeline> {
  const { fragments, intro, outro, fps, timelapse } = input;

  if (!fragments || fragments.length === 0) {
    throw new Error("No fragments provided");
  }

  // 1. Sort fragments
  const sortedFragments = [...fragments].sort((a, b) => a.order - b.order);

  const items: TimelineItem[] = [];

  // 2. Add intro
  const introPlaybackRate = 1;
  const introPublicUrl = intro.src;
  const introDurationSec = introPublicUrl ? await getMediaDurationInSeconds(introPublicUrl) : INTRO_DURATION_SECONDS;
  const introDurationInFrames = Math.floor((introDurationSec * fps) / introPlaybackRate);
  items.push({
    type: "intro",
    src: introPublicUrl,
    durationInFrames: introDurationInFrames,
  });

  // 3. Process fragments
  for (const fragment of sortedFragments) {
    const publicUrl = fragment.src;

    // Get duration
    const durationSec = await getMediaDurationInSeconds(publicUrl);

    let playbackRate = 1;

    if (timelapse?.enabled) {
      const applies = !timelapse.fragmentIds || timelapse.fragmentIds.includes(fragment.id);

      if (applies) {
        playbackRate = timelapse.speed;
      }
    }

    const durationInFrames = Math.floor((durationSec * fps) / playbackRate);

    items.push({
      type: "video",
      src: publicUrl,
      durationInFrames,
      playbackRate,
    });
  }

  // 4. Add outro
  const outroPlaybackRate = 1;
  const outroPublicUrl = outro.src;
  const outroDurationSec = outroPublicUrl ? await getMediaDurationInSeconds(outroPublicUrl) : 0;
  const outroDurationInFrames = Math.floor((outroDurationSec * fps) / outroPlaybackRate);

  items.push({
    type: "outro",
    src: outroPublicUrl,
    durationInFrames: outroDurationInFrames,
  });

  // 5. Compute total frames
  const totalFrames = items.reduce((sum, item) => sum + item.durationInFrames, 0);

  return {
    items,
    totalFrames,
  };
}
