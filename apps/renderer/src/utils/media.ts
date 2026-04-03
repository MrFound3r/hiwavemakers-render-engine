import fs from "fs";
import path from "path";
import { buildUrl } from ".";

export function getStaticOutroVideo() {
  const VIDEO_DIR = path.resolve(process.cwd(), "../../storage/assets/videos");
  const outroPath = path.join(VIDEO_DIR, "logo-outro.mp4");

  if (fs.existsSync(outroPath)) {
    const publicUrl = buildUrl(`/static/assets/videos/logo-outro.mp4`);
    return publicUrl;
  }
  return null;
}
