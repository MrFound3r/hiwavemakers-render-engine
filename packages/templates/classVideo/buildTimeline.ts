import fs from "fs";
import path from "path";
import { getVideoDurationInSeconds } from "@video-utils/index";
import { Timeline, TimelineItem } from "./types";

type BuildTimelineInput = {
  fragments: {
    id: string;
    src: string;
    order: number;
  }[];
  intro: {
    durationInFrames: number;
  };
  outro: {
    src: string;
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
  items.push({
    type: "intro",
    durationInFrames: intro.durationInFrames,
  });

  // 3. Process fragments
  for (const fragment of sortedFragments) {
    const publicUrl = fragment.src;

    // Validate file exists
    // if (!fs.existsSync(absPath)) {
    //   throw new Error(`Fragment file not found: ${absPath}`);
    // }

    // Get duration
    const durationSec = await getVideoDurationInSeconds(publicUrl);

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
  const outroDurationSec = await getVideoDurationInSeconds(outroPublicUrl);
  const outroDurationInFrames = Math.floor((outroDurationSec * fps) / outroPlaybackRate);

  // if (!fs.existsSync(outroPath)) {
  //   throw new Error(`Outro file not found: ${outroPath}`);
  // }

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
