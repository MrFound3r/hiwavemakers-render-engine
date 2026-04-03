// This utility module provides functions to retrieve available background images from a specified directory and to select a random background image or video (new) for use in video compositions.
// It reads the contents of the backgrounds directory, filters for valid image or video files, and constructs URLs for those images based on environment variables for the domain and port.
// apps/renderer/src/utils/backgrounds.ts
import path from "path";
import { buildUrl, getFiles } from ".";

// const VIDEO_DIR = path.resolve(process.cwd(), "../../storage/assets/videos/backgrounds/video-frames");

const IMAGE_DIR = path.resolve(process.cwd(), "../../storage/assets/images/backgrounds/video-frames");

type BackgroundAsset = {
  src: string;
  isVideo?: boolean;
};

export function getAvailableBackgrounds(): BackgroundAsset[] {
  // 1. Try images first
  const imageFiles = getFiles(IMAGE_DIR, /\.(jpg|jpeg|png|webp)$/i);

  if (imageFiles.length > 0) {
    return imageFiles.map((file) => ({
      src: buildUrl(`/static/assets/images/backgrounds/video-frames/${file}`),
      isVideo: false,
    }));
  }

  // 2. Fallback to videos
  // const videoFiles = getFiles(VIDEO_DIR, /\.(mp4|webm|mov)$/i);

  // if (videoFiles.length > 0) {
  //   return videoFiles.map((file) => ({
  //     src: buildUrl(`/static/assets/videos/backgrounds/video-frames/${file}`),
  //     isVideo: true,
  //   }));
  // }

  // 3. Nothing found
  return [];
}

export function getRandomBackground(): BackgroundAsset | null {
  const backgrounds = getAvailableBackgrounds();

  if (backgrounds.length === 0) return null;

  const index = Math.floor(Math.random() * backgrounds.length);
  return backgrounds[index];
}
