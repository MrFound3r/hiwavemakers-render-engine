// apps/renderer/src/config.ts
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
  portraitWidth: Number(process.env.PORTRAIT_WIDTH) || 1080,
  portraitHeight: Number(process.env.PORTRAIT_HEIGHT) || 1920,
  landscapeWidth: Number(process.env.LANDSCAPE_WIDTH) || 1920,
  landscapeHeight: Number(process.env.LANDSCAPE_HEIGHT) || 1080,
};
