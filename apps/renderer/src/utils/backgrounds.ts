import fs from "fs";
import path from "path";

const BACKGROUNDS_DIR = path.resolve(process.cwd(), "../../storage/assets/images/backgrounds/video-frames");

export function getAvailableBackgrounds(): string[] {
  try {
    const files = fs.readdirSync(BACKGROUNDS_DIR);

    const mappedFiles = files
      .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .map((file) => `${process.env.DOMAIN}:${process.env.PORT || 4000}/static/assets/images/backgrounds/video-frames/${file}`);

    return mappedFiles;
  } catch (err) {
    console.error("Failed to read backgrounds directory:", err);
    return [];
  }
}

export function getRandomBackground(): string | null {
  const backgrounds = getAvailableBackgrounds();

  if (backgrounds.length === 0) return null;

  const index = Math.floor(Math.random() * backgrounds.length);
  return backgrounds[index];
}
