// apps/renderer/src/render.ts
import { bundle } from "@remotion/bundler";
import { makeCancelSignal, renderMedia } from "@remotion/renderer";
import { config } from "./config";
import path from "path";
import { getVideoDurationInSeconds } from "@video-utils/index";
import { buildTimeline } from "@templates/index";
import { getCompositions } from "@remotion/renderer";
import * as dotenv from "dotenv";
import { db } from "packages/db";
dotenv.config();

// 0. Create cancel signal
const activeRenders = new Map<string, { cancel: () => void }>();

let bundleLocation: string | null = null;
const VIDEO_RENDER_CONCURRENCY = parseInt(process.env.VIDEO_RENDER_CONCURRENCY ?? "4", 10);
const VIDEO_RENDER_BITRATE = process.env.VIDEO_RENDER_BITRATE || "1000k";
const VIDEO_RENDER_AUDIO_CODEC = process.env.VIDEO_RENDER_AUDIO_CODEC || "aac";
const VIDEO_RENDER_VIDEO_CODEC = process.env.VIDEO_RENDER_VIDEO_CODEC || "h264";
console.log("Video Render Concurrency set to:", VIDEO_RENDER_CONCURRENCY);

async function getBundle() {
  if (!bundleLocation) {
    bundleLocation = await bundle({
      // entryPoint: path.resolve("../../packages/remotion/src/index.ts"),
      entryPoint: require.resolve("@remotion/index"),
      outDir: config.bundlePath,
    });
  }
  return bundleLocation;
}

export async function renderJob(job: any) {
  try {
    const timeline = await buildTimeline({
      fragments: job.inputProps.fragments,
      intro: {
        durationInFrames: 90,
      },
      outro: {
        src: job.inputProps.outro,
        // durationInFrames: 90,
      },
      fps: config.fps,
    });

    const bundleLocation = await getBundle();

    const inputProps = {
      timeline: timeline.items,
      totalFrames: timeline.totalFrames,
      studentName: job.inputProps.studentName,
      className: job.inputProps.className,
    };

    const compositions = await getCompositions(bundleLocation, {
      inputProps,
    });

    const composition = compositions.find((c) => c.id === job.compositionId);

    if (!composition) {
      throw new Error(`Composition not found: ${job.compositionId}`);
    }

    const output = path.join(config.storagePath, "renders", `${job.id}.mp4`);

    const { cancelSignal, cancel } = makeCancelSignal();
    // register
    activeRenders.set(job.id, { cancel });

    const renderRes = await renderMedia({
      composition: {
        ...composition,
        durationInFrames: timeline.totalFrames,
      },
      serveUrl: bundleLocation,
      concurrency: VIDEO_RENDER_CONCURRENCY,
      audioCodec: VIDEO_RENDER_AUDIO_CODEC as any,
      videoBitrate: VIDEO_RENDER_BITRATE,
      imageFormat: "jpeg",
      hardwareAcceleration: "if-possible",
      codec: VIDEO_RENDER_VIDEO_CODEC as any,
      outputLocation: output,
      inputProps,
      cancelSignal,
      onProgress: async (progress) => {
        console.log(
          `Render progress: ${Math.round(progress.progress * 100)}% | Frame: ${progress.renderedFrames} | Render ETA: ${progress.renderEstimatedTime} | Render Done In: ${progress.renderedDoneIn}`,
        );

        const [rows]: any = await db.query(`SELECT cancelled FROM renders WHERE id = ?`, [job.id]);

        if (rows[0]?.cancelled) {
          cancel(); // trigger abort
          return;
        }

        await db.query(`UPDATE renders SET progress = ? WHERE id = ?`, [progress.progress, job.id]);
      },
    });
    console.log("🚀 ~ renderJob ~ renderRes:", renderRes);

    activeRenders.delete(job.id);

    return {
      output,
      inputProps,
      compositionId: composition.id,
      job,
    };
  } catch (error) {
    console.log("🚀 ~ renderJob ~ error:", error);
    activeRenders.delete(job.id);
  }
}

export function cancelRender(jobId: string) {
  const active = activeRenders.get(jobId);

  if (active) {
    active.cancel();
    return true;
  }

  return false;
}

export async function getVideoDurationInSecondsJob(job: any) {
  const testPath = job.inputProps?.testVideoPath;

  if (testPath) {
    const duration = await getVideoDurationInSeconds(testPath);
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

export async function buildTimelineJob(job: any) {
  const timeline = await buildTimeline({
    fragments: job.inputProps.fragments,
    intro: {
      durationInFrames: 90, // 3 seconds @ 30fps
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
