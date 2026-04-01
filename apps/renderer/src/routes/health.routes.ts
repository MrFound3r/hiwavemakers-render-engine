// apps/renderer/src/routes/health.routes.ts
import { Router } from "express";

const router = Router();

// GET /health
router.get("/", (_, res) => {
  res.send("ok");
});

export default router;
