// apps/renderer/src/routes/students.routes.ts

import { Router } from "express";
import { db } from "@hiwave/db";

const router = Router();

// POST /students/join — Save a student when they join (Ignore if already exists)
router.post("/join", async (req, res) => {
	try {
		const { roomUuid, studentUuid, name, email } = req.body;

		if (!roomUuid || !studentUuid || !name) {
			return res.status(400).json({ error: "Missing required fields: roomUuid, studentUuid, name" });
		}

		const [result]: any = await db.query(
			`INSERT IGNORE INTO students (room_uuid, student_uuid, name, email) 
       VALUES (?, ?, ?, ?)`,
			[roomUuid, studentUuid, name, email || null],
		);

		if (result.affectedRows === 0) {
			return res.json({
				success: true,
				message: "Student already exists in database, no new entry created.",
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

		const [result]: any = await db.query(
			`UPDATE students 
       SET videos = JSON_ARRAY_APPEND(videos, '$', ?) 
       WHERE student_uuid = ? AND room_uuid = ?`,
			[videoUrl, studentUuid, roomUuid],
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

// PATCH /students/:roomUuid/:studentUuid/render-id — Link a render job to a student
router.patch("/:roomUuid/:studentUuid/render-id", async (req, res) => {
	try {
		const { roomUuid, studentUuid } = req.params;
		const { renderId } = req.body;

		if (!renderId) {
			return res.status(400).json({ error: "Missing renderId" });
		}

		const [result]: any = await db.query(
			`UPDATE students 
       SET render_id = ? 
       WHERE student_uuid = ? AND room_uuid = ?`,
			[renderId, studentUuid, roomUuid],
		);

		if (result.affectedRows === 0) {
			return res.status(404).json({ error: "Student not found in this room" });
		}

		res.json({ success: true, message: "Render ID linked successfully" });
	} catch (error) {
		console.error("Error updating render ID:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// GET /students/room/:roomUuid — Get all students & their render progress using a JOIN
router.get("/room/:roomUuid", async (req, res) => {
	try {
		const [rows]: any = await db.query(
			`
      SELECT 
        s.id,
        s.room_uuid,
        s.student_uuid,
        s.name,
        s.email,
        s.videos,
        s.created_at,
        s.render_id,

        r.status AS render_status,
        r.progress AS render_progress,
        r.output_path AS render_url,
		r.thumbnail_path AS render_thumbnail,
        r.error AS render_error,
        r.attempts AS render_attempts,
        r.max_attempts AS render_max_attempts,
        r.cancelled AS render_cancelled
      FROM students s
      LEFT JOIN renders r ON s.render_id = r.id
      WHERE s.room_uuid = ?
      ORDER BY s.created_at ASC
      `,
			[req.params.roomUuid]
		);

		const parsedRows = rows.map((row: any) => ({
			...row,
			videos: typeof row.videos === "string" ? JSON.parse(row.videos) : row.videos,
		}));

		res.json(parsedRows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// GET /students/rooms — Get a list of all unique classes/rooms
router.get("/rooms", async (req, res) => {
	try {
		const [rows]: any = await db.query(
			`SELECT room_uuid 
       FROM students 
       GROUP BY room_uuid 
       ORDER BY MAX(created_at) DESC`,
		);
		res.json(rows);
	} catch (error) {
		console.error("Error fetching rooms:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
