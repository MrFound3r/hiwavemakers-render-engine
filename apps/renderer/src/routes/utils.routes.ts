// apps/renderer/src/routes/utils.routes.ts
import { Router } from "express";
import { buildTimelineService, getVideoDurationInSecondsService } from "../services/utils.services";
import fs from "fs";
import multer from "multer";
import { paths } from "packages/config/path";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";

// Tell fluent-ffmpeg where the actual engine is located
if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
}

const router = Router();

if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic); 
}

// Create the folder if it doesn’t exist (Moved to top so it's ready for multer)
if (!fs.existsSync(paths.recordings)) {
    fs.mkdirSync(paths.recordings, { recursive: true });
    console.log(`Created folder: ${paths.recordings}`);
}

const recordingsStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, paths.recordings);
    },
    filename: (req, file, cb) => {
        // NEW: Prefix with "raw-" so we know this is the broken browser file
        const uniqueName = `raw-${Date.now()}-${file.originalname}`;
        cb(null, uniqueName); 
    },
});

const recordingUpload = multer({ storage: recordingsStorage });

//POST /recording_upload
router.post("/recording_upload", recordingUpload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ error: "No file uploaded." });
        }

        const rawFilePath = req.file.path;
        
        // Define what the final, fixed file will be called
        const fixedFileName = `fixed-${Date.now()}-${req.file.originalname}`;
        const fixedFilePath = path.join(paths.recordings, fixedFileName);

        console.log(`🛠️ Repairing video metadata for: ${req.file.originalname}...`);

        // Wrap FFmpeg in a Promise so we can use async/await cleanly
        await new Promise((resolve, reject) => {
            ffmpeg(rawFilePath)
                .outputOptions([
                    "-c copy" // Instantly copies the data while rewriting the duration header
                ])
                .save(fixedFilePath)
                .on("end", () => resolve(true))
                .on("error", (err) => reject(err));
        });

        console.log("✅ File repaired successfully!");

        // Delete the broken raw file to save disk space
        fs.unlink(rawFilePath, (err) => {
            if (err) console.error("Could not delete raw temp file:", err);
        });

        // Point the frontend to the newly fixed file
        let fileUrl = `/recordings/${fixedFileName}`;
        console.log("File ready at:", fileUrl);

        res.json({
            ok: true,
            filePath: fileUrl,
        });
    } catch (error) {
        console.error("Upload/Repair error:", error);
        
        // Clean up the raw file if the FFmpeg process fails
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.json({
            ok: false,
        });
    }
});

// POST /get-duration-seconds
router.post("/get-duration-seconds", async (req, res) => {
  const result = await getVideoDurationInSecondsService(req.body);
  res.json(result);
});

// POST /build-timeline
router.post("/build-timeline", async (req, res) => {
  const result = await buildTimelineService(req.body);
  res.json(result);
});

export default router;