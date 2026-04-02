// apps/renderer/src/routes/students.routes.ts

import { Router } from "express";
import { db } from "packages/db";

const router = Router();

// POST /students/join — Save a student when they join (Ignore if already exists)
router.post("/join", async (req, res) => {
  try {
    const { roomUuid, studentUuid, name, email } = req.body;

    if (!roomUuid || !studentUuid || !name) {
      return res.status(400).json({ error: "Missing required fields: roomUuid, studentUuid, name" });
    }

    // INSERT IGNORE tells MySQL to silently skip the insertion if the unique 
    // student_uuid already exists in the table.
    const [result]: any = await db.query(
      `INSERT IGNORE INTO students (room_uuid, student_uuid, name, email) 
       VALUES (?, ?, ?, ?)`,
      [roomUuid, studentUuid, name, email || null]
    );

    // If affectedRows is 0, it means the row already existed and was skipped.
    if (result.affectedRows === 0) {
      return res.json({ 
        success: true, 
        message: "Student already exists in database, no new entry created." 
      });
    }

    res.json({ success: true, message: "New student registered successfully." });
  } catch (error) {
    console.error("Error saving student:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /students/:roomUuid/:studentUuid/video — Add a recording URL
router.patch("/:roomUuid/:studentUuid/video", async (req, res) => {
  try {
    const { roomUuid, studentUuid } = req.params;
    const { videoUrl } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: "Missing videoUrl" });
    }

    // Now checks BOTH student_uuid and room_uuid
    const [result]: any = await db.query(
      `UPDATE students 
       SET videos = JSON_ARRAY_APPEND(videos, '$', ?) 
       WHERE student_uuid = ? AND room_uuid = ?`,
      [videoUrl, studentUuid, roomUuid]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Student not found in this room" });
    }

    res.json({ success: true, message: "Video added" });
  } catch (error) {
    console.error("Error adding video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /students/:roomUuid/:studentUuid/render-status — Update the render status
router.patch("/:roomUuid/:studentUuid/render-status", async (req, res) => {
  try {
    const { roomUuid, studentUuid } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Missing status" });
    }

    // Now checks BOTH student_uuid and room_uuid
    const [result]: any = await db.query(
      `UPDATE students 
       SET render_status = ? 
       WHERE student_uuid = ? AND room_uuid = ?`,
      [status, studentUuid, roomUuid]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Student not found in this room" });
    }

    res.json({ success: true, message: "Render status updated" });
  } catch (error) {
    console.error("Error updating render status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /students/room/:roomUuid — Get all students & their recordings for a specific room
router.get("/room/:roomUuid", async (req, res) => {
  try {
    const [rows]: any = await db.query(
      `SELECT student_uuid, name, email, videos, render_status, created_at 
       FROM students 
       WHERE room_uuid = ? 
       ORDER BY created_at ASC`,
      [req.params.roomUuid]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching room data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;