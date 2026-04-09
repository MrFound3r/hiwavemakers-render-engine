// apps/renderer/src/routes/renders.routes.ts
import { Router } from "express";
import { db } from "@hiwave/db";

const router = Router();

// GET /renders — list all renders
router.get("/", async (_, res) => {
  const [rows]: any = await db.query(`SELECT * FROM renders ORDER BY created_at DESC`);
  res.json(rows);
});

// GET /renders/:id — get a single render
router.get("/:id", async (req, res) => {
  const [rows]: any = await db.query(`SELECT * FROM renders WHERE id = ?`, [req.params.id]);

  if (!rows.length) {
    return res.status(404).json({ error: "Not found" });
  }

  res.json(rows[0]);
});

export default router;
