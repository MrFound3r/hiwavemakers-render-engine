// apps/renderer/src/routes/utils.routes.ts

import { Router } from "express";
import { buildTimelineJob, getVideoDurationInSecondsJob } from "../render";
import fs from "fs";
import multer from "multer";
import { paths } from "packages/config/path";

const router = Router();

const recordingsStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, paths.recordings);
	},
	filename: (req, file, cb) => {
		const uniqueName = `${Date.now()}-${file.originalname}`;
		cb(null, uniqueName); // Save the file with a unique name
	},
});

const recordingUpload = multer({ storage: recordingsStorage });

// Create the folder if it doesn’t exist
if (!fs.existsSync(paths.recordings)) {
	fs.mkdirSync(paths.recordings, { recursive: true });
	console.log(`Created folder: ${paths.recordings}`);
}

//POST /recording_upload
router.post("/recording_upload", recordingUpload.single("file"), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).send({ error: "No file uploaded." });
		}

		let fileUrl = `/recordings/${req.file.filename}`;

		console.log("Uploading file", fileUrl);

		res.json({
			ok: true,
			filePath: fileUrl,
		});
	} catch (error) {
		console.error(error);
		res.json({
			ok: false,
		});
	}
});

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
