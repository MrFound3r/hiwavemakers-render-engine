import fs from "fs";
import path from "path";

export * from "./media";
export * from "./backgrounds";

export function buildUrl(relativePath: string) {
  return `${process.env.DOMAIN}:${process.env.PORT || 4000}${relativePath}`;
}

export function getFiles(dir: string, extensions: RegExp): string[] {
  try {
    const files = fs.readdirSync(dir);

    return files.filter((file) => extensions.test(file));
  } catch (err) {
    console.error(`Failed to read directory: ${dir}`, err);
    return [];
  }
}

export function getRandomThumbnail() {
  const THUMBNAIL_DIR = path.resolve(process.cwd(), "../../storage/assets/images/thumbnails");
  const thumbnailFiles = getFiles(THUMBNAIL_DIR, /\.(jpg|jpeg|png|webp)$/i);

  let pickedThumbnails: { src: string }[] = [];

  if (thumbnailFiles.length > 0) {
    pickedThumbnails = thumbnailFiles.map((file) => ({
      src: buildUrl(`/static/assets/images/thumbnails/${file}`),
    }));
  }

  if (pickedThumbnails.length === 0) return null;

  const index = Math.floor(Math.random() * pickedThumbnails.length);
  return pickedThumbnails[index];
}
