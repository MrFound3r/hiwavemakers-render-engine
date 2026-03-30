import path from "path";
import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 4000,
  storagePath: path.resolve(process.env.STORAGE_PATH || "./storage"),
  bundlePath: path.resolve(process.env.BUNDLE_PATH || "./.bundle"),
  fps: Number(process.env.FPS) || 30,
  width: Number(process.env.WIDTH) || 1920,
  height: Number(process.env.HEIGHT) || 1080,
};
