// apps/renderer/src/routes/render.routes.ts

import { Router } from "express";
import { enqueueJobs } from "@queue/index";
import { cancelRender } from "../render";
import { RenderRequestFromPropsSchema, BatchRenderFromPropsSchema } from "@templates/schemas/renderRequest.schema";
import { db } from "packages/db";
import z from "zod";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// POST /render — enqueue one or many jobs
router.post("/", async (req, res) => {
  try {
    const parsed = Array.isArray(req.body)
      ? BatchRenderFromPropsSchema.parse(req.body)
      : [RenderRequestFromPropsSchema.parse(req.body)];

    const jobs = parsed.map((item) => ({
      id: uuidv4(),
      compositionId: item.compositionId,
      inputProps: item.inputProps,
    }));

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
  const [rows]: any = await db.query(`SELECT id FROM renders WHERE status = 'processing'`);

  for (const job of rows) {
    cancelRender(job.id);
  }

  await db.query(`UPDATE renders SET cancelled = TRUE WHERE status = 'processing'`);

  res.json({ success: true });
});

// POST /render/:id/cancel
router.post("/:id/cancel", async (req, res) => {
  const { id } = req.params;

  await db.query(`UPDATE renders SET cancelled = TRUE WHERE id = ?`, [id]);

  const cancelled = cancelRender(id);

  res.json({ success: true, inProgressCancelled: cancelled });
});

export default router;