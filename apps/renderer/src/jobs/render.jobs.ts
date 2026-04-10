// apps/renderer/src/jobs/render.jobs.ts
import { bundle } from "@remotion/bundler";
import { makeCancelSignal, renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { config } from "../config";
import path from "path";
import fs from "fs";
import * as dotenv from "dotenv";
import { db } from "@hiwave/db";
import { RenderJob } from "../types";
import { buildTimeline } from "@hiwave/templates";
import { getMediaDurationInSeconds, getMediaType } from "@hiwave/video-utils";

dotenv.config();

// 0. Create cancel signal
export const activeRenders = new Map<string, { cancel: () => void }>();

let bundleLocation: string | null = null;

const VIDEO_RENDER_CONCURRENCY = parseInt(process.env.VIDEO_RENDER_CONCURRENCY ?? "4", 10);
const VIDEO_RENDER_BITRATE = process.env.VIDEO_RENDER_BITRATE || "1000k";
const VIDEO_RENDER_AUDIO_CODEC = process.env.VIDEO_RENDER_AUDIO_CODEC || "aac";
const VIDEO_RENDER_VIDEO_CODEC = process.env.VIDEO_RENDER_VIDEO_CODEC || "h264";
const VIDEO_RENDER_TIMEOUT_MS = parseInt(process.env.VIDEO_RENDER_TIMEOUT_MS ?? "30000", 10);

console.log("Video Render Concurrency set to:", VIDEO_RENDER_CONCURRENCY);

const monorepoRoot = path.resolve(__dirname, "../../../../");
const remotionEngineRoot = path.join(monorepoRoot, "packages", "remotion-engine");

const resolveEntryPoint = () => {
  const candidates = [
    path.join(remotionEngineRoot, "src", "index.ts"),
    path.join(remotionEngineRoot, "src", "index.tsx"),
    path.join(remotionEngineRoot, "src", "index.js"),
    path.join(remotionEngineRoot, "src", "index.jsx"),
  ];

  const found = candidates.find((candidate) => fs.existsSync(candidate));

  if (!found) {
    throw new Error(`Could not find Remotion entry point. Tried:\n${candidates.join("\n")}`);
  }

  return found;
};

console.log("cwd:", process.cwd());
console.log("__dirname:", __dirname);
console.log("monorepoRoot:", monorepoRoot);
console.log("remotionEngineRoot:", remotionEngineRoot);
console.log("entryPoint:", resolveEntryPoint());
console.log(`🚀 ~ getBundle ~ path.join(remotionEngineRoot, "public":`, path.join(remotionEngineRoot, "public"));

async function getBundle() {
  if (!bundleLocation) {
    bundleLocation = await bundle({
      entryPoint: resolveEntryPoint(),
      outDir: config.bundlePath,
      rootDir: monorepoRoot,
      publicDir: path.join(monorepoRoot, "public"),
    });
  }

  return bundleLocation;
}

const getThumbnailCompositionId = (compositionId: string) => {
  if (compositionId === "class-video-v1-landscape") {
    return "class-video-v1-thumbnail-landscape";
  }

  return "class-video-v1-thumbnail-portrait";
};

const getThumbnailOutputPath = (jobId: string) => {
  return path.join(config.storagePath, "renders", `${jobId}-thumbnail.jpg`);
};

export async function renderJob(job: RenderJob) {
  console.log(`Trying to render video with job ID: ${job.id} and composition ID: ${job.compositionId}`);

  try {
    const timeline = await buildTimeline({
      fragments: job.inputProps.fragments,
      intro: {
        src: job.inputProps.intro,
      },
      outro: {
        src: job.inputProps.outro,
      },
      fps: config.fps,
    });

    const bundleLocation = await getBundle();

    let backgroundAudio: {
      src: string;
      durationInSeconds: number;
      volume?: number;
    } | null = null;

    if (job.inputProps.backgroundAudio) {
      backgroundAudio = {
        src: job.inputProps.backgroundAudio.src,
        durationInSeconds: await getMediaDurationInSeconds(job.inputProps.backgroundAudio.src),
        volume: job.inputProps.backgroundAudio.volume,
      };
    }

    console.log("backgroundAudio:", backgroundAudio);

    let background: {
      src: string;
      durationInSeconds: number;
      isVideo: boolean;
    } | null = null;

    if (job.inputProps.background && job.inputProps.background.src) {
      background = {
        src: job.inputProps.background.src,
        durationInSeconds: 0,
        isVideo:
          job.inputProps.background.isVideo === undefined
            ? (await getMediaType(job.inputProps.background.src)) === "video"
            : job.inputProps.background.isVideo,
      };
    }

    if (background?.isVideo) {
      background.durationInSeconds = await getMediaDurationInSeconds(background.src);
    }

    console.log("background:", background);

    const inputProps = {
      timeline: timeline.items,
      totalFrames: timeline.totalFrames,
      studentName: job.inputProps.studentName,
      className: job.inputProps.className,
      backgroundAudio,
      background,
      portraitWidth: config.portraitWidth,
      portraitHeight: config.portraitHeight,
      landscapeWidth: config.landscapeWidth,
      landscapeHeight: config.landscapeHeight,
      thumbnail: job.inputProps.thumbnail ?? null,
      phraseSeed: `${job.id}-${job.inputProps.studentName ?? ""}`,
    };

    console.log("🚀 ~ renderJob ~ inputProps.timeline:", inputProps.timeline);

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: job.compositionId,
      inputProps,
      timeoutInMilliseconds: VIDEO_RENDER_TIMEOUT_MS,
      logLevel: "info",
    });

    const output = path.join(config.storagePath, "renders", `${job.id}.mp4`);

    const { cancelSignal, cancel } = makeCancelSignal();
    activeRenders.set(job.id, { cancel });

    const renderRes = await renderMedia({
      composition: {
        ...composition,
        durationInFrames: timeline.totalFrames,
      },
      serveUrl: bundleLocation,
      timeoutInMilliseconds: VIDEO_RENDER_TIMEOUT_MS,
      concurrency: VIDEO_RENDER_CONCURRENCY,
      audioCodec: VIDEO_RENDER_AUDIO_CODEC as any,
      videoBitrate: VIDEO_RENDER_BITRATE,
      imageFormat: "jpeg",
      hardwareAcceleration: "if-possible",
      codec: VIDEO_RENDER_VIDEO_CODEC as any,
      mediaCacheSizeInBytes: 512 * 1024 * 1024, // example: 512MB
      disallowParallelEncoding: true,
      outputLocation: output,
      inputProps,
      cancelSignal,
      onProgress: async (progress) => {
        console.log(
          `Render progress: ${Math.round(progress.progress * 100)}% | Frame: ${progress.renderedFrames} | Render ETA: ${progress.renderEstimatedTime} | Render Done In: ${progress.renderedDoneIn}`,
        );

        const [rows]: any = await db.query(`SELECT cancelled FROM renders WHERE id = ?`, [job.id]);

        if (rows[0]?.cancelled) {
          cancel();
          return;
        }

        await db.query(`UPDATE renders SET progress = ? WHERE id = ?`, [progress.progress, job.id]);
      },
    });

    console.log("renderRes:", renderRes);

    let thumbnailOutput: string | null = null;

    if (job.inputProps.thumbnail?.src) {
      const thumbnailCompositionId = getThumbnailCompositionId(job.compositionId);

      const thumbnailComposition = await selectComposition({
        serveUrl: bundleLocation,
        id: thumbnailCompositionId,
        inputProps,
        timeoutInMilliseconds: VIDEO_RENDER_TIMEOUT_MS,
        logLevel: "info",
      });

      thumbnailOutput = getThumbnailOutputPath(job.id);

      await renderStill({
        composition: thumbnailComposition,
        serveUrl: bundleLocation,
        output: thumbnailOutput,
        inputProps,
        imageFormat: "jpeg",
      });
    }

    return {
      output,
      thumbnailOutput,
      inputProps,
      compositionId: composition.id,
      job,
    };
  } catch (error) {
    console.error("Render failed:", error);
    throw error;
  } finally {
    activeRenders.delete(job.id);
  }
}
