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
const VIDEO_RENDER_IMAGE_FORMAT = (process.env.VIDEO_RENDER_IMAGE_FORMAT || "png").toLowerCase();
const VIDEO_RENDER_HARDWARE_ACCELERATION = (process.env.VIDEO_RENDER_HARDWARE_ACCELERATION || "disabled").toLowerCase();
const VIDEO_RENDER_JPEG_QUALITY = parseInt(process.env.VIDEO_RENDER_JPEG_QUALITY ?? "95", 10);
const VIDEO_RENDER_CRF = parseInt(process.env.VIDEO_RENDER_CRF ?? "18", 10);
const VIDEO_RENDER_COLOR_SPACE = process.env.VIDEO_RENDER_COLOR_SPACE || "bt709";
const VIDEO_RENDER_QUALITY_MODE = (process.env.VIDEO_RENDER_QUALITY_MODE || "crf").toLowerCase();

type RenderQualityMode = "crf" | "bitrate";

function isHardwareAccelerationEnabled(value: string): boolean {
  return !["disabled", "off", "false", "none", "no"].includes(value);
}

function assertIntegerInRange(name: string, value: number, min: number, max: number) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}. Received: ${value}`);
  }
}

function assertNonEmpty(name: string, value: string) {
  if (!value || !value.trim()) {
    throw new Error(`${name} must not be empty.`);
  }
}

function normalizeQualityMode(value: string): RenderQualityMode {
  if (value === "crf" || value === "bitrate") {
    return value;
  }

  throw new Error(`VIDEO_RENDER_QUALITY_MODE must be either "crf" or "bitrate". Received: ${value}`);
}

function buildRenderQualityOptions(): { crf: number } | { videoBitrate: string } {
  const qualityMode = normalizeQualityMode(VIDEO_RENDER_QUALITY_MODE);
  const hardwareAccelerationEnabled = isHardwareAccelerationEnabled(VIDEO_RENDER_HARDWARE_ACCELERATION);

  assertIntegerInRange("VIDEO_RENDER_CRF", VIDEO_RENDER_CRF, 0, 51);
  assertIntegerInRange("VIDEO_RENDER_JPEG_QUALITY", VIDEO_RENDER_JPEG_QUALITY, 0, 100);
  assertNonEmpty("VIDEO_RENDER_BITRATE", VIDEO_RENDER_BITRATE);

  if (qualityMode === "crf") {
    if (hardwareAccelerationEnabled) {
      throw new Error(
        `VIDEO_RENDER_QUALITY_MODE=crf cannot be used when hardware acceleration is enabled (${VIDEO_RENDER_HARDWARE_ACCELERATION}). ` +
          `Set VIDEO_RENDER_HARDWARE_ACCELERATION=disabled or switch VIDEO_RENDER_QUALITY_MODE=bitrate.`,
      );
    }

    return { crf: VIDEO_RENDER_CRF };
  }

  return { videoBitrate: VIDEO_RENDER_BITRATE };
}

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
  return path.join(config.storagePath, "renders", `${jobId}-thumbnail.png`);
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

    function buildRenderMediaOptions(params: {
      composition: typeof composition;
      totalFrames: number;
      serveUrl: string;
      output: string;
      inputProps: typeof inputProps;
      cancelSignal: typeof cancelSignal;
      onProgress: (progress: any) => Promise<void>;
    }) {
      const qualityOptions = buildRenderQualityOptions();

      return {
        composition: {
          ...params.composition,
          durationInFrames: params.totalFrames,
        },
        serveUrl: params.serveUrl,
        timeoutInMilliseconds: VIDEO_RENDER_TIMEOUT_MS,
        concurrency: VIDEO_RENDER_CONCURRENCY,
        audioCodec: VIDEO_RENDER_AUDIO_CODEC as any,
        imageFormat: VIDEO_RENDER_IMAGE_FORMAT as any,
        hardwareAcceleration: VIDEO_RENDER_HARDWARE_ACCELERATION as any,
        codec: VIDEO_RENDER_VIDEO_CODEC as any,
        colorSpace: VIDEO_RENDER_COLOR_SPACE as any,
        mediaCacheSizeInBytes: 512 * 1024 * 1024,
        disallowParallelEncoding: true,
        outputLocation: params.output,
        inputProps: params.inputProps,
        cancelSignal: params.cancelSignal,
        onProgress: params.onProgress,
        ...(VIDEO_RENDER_IMAGE_FORMAT === "jpeg" ? { jpegQuality: VIDEO_RENDER_JPEG_QUALITY } : {}),
        ...qualityOptions,
      };
    }

    const renderRes = await renderMedia(
      buildRenderMediaOptions({
        composition,
        totalFrames: timeline.totalFrames,
        serveUrl: bundleLocation,
        output,
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
      }),
    );

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
        imageFormat: "png",
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
