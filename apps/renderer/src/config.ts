import path from "path";
import dotenv from "dotenv";

dotenv.config();

// apps/renderer/src → apps/renderer
const appDir = path.resolve(__dirname, "..");

// apps/renderer/src → repo root
const rootDir = path.resolve(__dirname, "../../../");

export const config = {
  port: Number(process.env.PORT) || 4000,

  // storage is in repo root
  storagePath: path.resolve(rootDir, process.env.STORAGE_PATH || "storage"),

  // bundle is inside apps/renderer
  bundlePath: path.resolve(appDir, process.env.REMOTION_BUNDLE_PATH || ".bundle"),

  fps: Number(process.env.FPS) || 30,
  width: Number(process.env.WIDTH) || 1920,
  height: Number(process.env.HEIGHT) || 1080,
};
