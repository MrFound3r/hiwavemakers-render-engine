// apps/renderer/src/routes/render.routes.ts
import { Router } from "express";
import { db, DbRows } from "@hiwave/db";
import z from "zod";
import { v4 as uuidv4 } from "uuid";
import { cancelRender } from "../services/render.services";
import { getRandomBackground } from "../utils/backgrounds";
import { getStaticOutroVideo } from "../utils/media";
import { RenderInstance } from "../types";
import { enqueueJobs } from "@hiwave/queue";
import { QueueJob } from "@hiwave/queue/types";
import { BatchRenderFromPropsSchema, RenderRequestFromPropsSchema } from "@hiwave/templates";
import { BackgroundAsset, getRandomBackgroundTrack, getRandomThumbnail } from "../utils";

const router = Router();

// POST /render — enqueue one or many jobs
router.post("/", async (req, res) => {
  try {
    const parsed = Array.isArray(req.body)
      ? BatchRenderFromPropsSchema.parse(req.body)
      : [RenderRequestFromPropsSchema.parse(req.body)];

    let background: BackgroundAsset | null;
    let outroVideo: string | null;
    let thumbnail: { src: string } | null;
    let backgroundAudio: { src: string } | null;

    const jobs: QueueJob[] = parsed.map((item) => {
      // OUTRO
      let outroSrc: undefined | null | string = item.inputProps.outro;
      if (!outroSrc) {
        if (!outroVideo) {
          outroVideo = getStaticOutroVideo();
        }
        outroSrc = outroVideo;
      }

      // BACKGROUND
      let backgroundSrc = item.inputProps.background?.src;
      if (!backgroundSrc) {
        if (!background) {
          background = getRandomBackground();
        }
      } else {
        background = { src: backgroundSrc };
      }

      // THUMBNAIL
      let thumbnailSrc = item.inputProps.thumbnail?.src;
      if (!thumbnailSrc) {
        if (!thumbnail) {
          thumbnail = getRandomThumbnail();
        }
      } else {
        thumbnail = { src: thumbnailSrc };
      }

      // BACKGROUND TRACK
      let backgroundAudioSrc = item.inputProps.backgroundAudio?.src;
      if (!backgroundAudioSrc) {
        if (!backgroundAudio) {
          backgroundAudio = getRandomBackgroundTrack();
        }
      } else {
        backgroundAudio = { src: backgroundAudioSrc };
      }

      return {
        id: uuidv4(),
        compositionId: item.compositionId,
        inputProps: {
          studentName: item.inputProps.studentName,
          className: item.inputProps.className,
          fragments: item.inputProps.fragments,
          outro: outroSrc,
          intro: item.inputProps.intro,
          backgroundAudio: backgroundAudio || item.inputProps.backgroundAudio,
          background,
          thumbnail,
        },
      };
    });

    const result = await enqueueJobs(jobs);
    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request", issues: err.issues });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// POST /render/cancel-all
router.post("/cancel-all", async (_, res) => {
  const [rows] = await db.query<DbRows<RenderInstance>>(`SELECT id FROM renders WHERE status = 'processing'`);

  for (const job of rows) {
    cancelRender(job.id);
  }

  await db.query(`UPDATE renders SET cancelled = TRUE WHERE status = 'processing'`);

  res.json({ success: true, cancelledJobs: rows.map((r) => r.id) });
});

// POST /render/:id/cancel
router.post("/:id/cancel", async (req, res) => {
  const { id } = req.params;

  await db.query(`UPDATE renders SET cancelled = TRUE WHERE id = ?`, [id]);

  const cancelled = cancelRender(id);

  res.json({ success: true, inProgressCancelled: cancelled, id });
});

// POST /render/:id/retry
router.post("/:id/retry", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query<DbRows<RenderInstance>>("SELECT * FROM renders WHERE id = ?", [id]);
    const job = rows[0];
    // Implement retry logic here
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    if (job.status === "failed") {
      await db.query(`UPDATE renders SET status = 'pending', attempts = 0, error = NULL, cancelled = 0 WHERE id = ?`, [
        id,
      ]);
      const [rows] = await db.query<DbRows<RenderInstance>>("SELECT * FROM renders WHERE id = ?", [id]);
      const result = rows[0];
      res.status(200).json({ message: `Job ${id} has been reset to pending. It will be retried shortly.`, result });
    }

    res.status(400).json({ error: "Only failed jobs can be retried" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

// POST /render/retry-all
router.post("/retry-all", async (req, res) => {
  try {
    const [rows] = await db.query<DbRows<RenderInstance>>(
      `SELECT id FROM renders 
       WHERE status = 'failed' 
       OR (cancelled = 1 AND status != 'done')`,
    );

    await db.query(
      `UPDATE renders 
       SET status = 'pending', attempts = 0, error = NULL, cancelled = 0 
       WHERE status = 'failed' 
       OR (cancelled = 1 AND status != 'done')`,
    );

    res.status(200).json({
      message: `All failed and eligible cancelled jobs have been reset to pending.`,
      retriedJobs: rows.map((r) => r.id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
