// apps/renderer/src/routes/utils.routes.ts

import { Router } from "express";
import { buildTimelineJob, getVideoDurationInSecondsJob } from "../render";

const router = Router();

// POST /get-duration-seconds
router.post("/get-duration-seconds", async (req, res) => {
  const result = await getVideoDurationInSecondsJob(req.body);
  res.json(result);
});

// POST /build-timeline
router.post("/build-timeline", async (req, res) => {
  const result = await buildTimelineJob(req.body);
  res.json(result);
});

export default router;