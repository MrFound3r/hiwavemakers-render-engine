import ffmpeg from "fluent-ffmpeg";
import ffprobe from "ffprobe-static";

ffmpeg.setFfprobePath(ffprobe.path);

export const getMediaDurationInSeconds = (filePath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error(`FFprobe error for ${filePath}:`, err.message);
        return reject(err);
      }

      let duration = Number(metadata.format?.duration);

      if (!duration || isNaN(duration)) {
        const videoStream = metadata.streams?.find((s) => s.codec_type === 'video');
        duration = Number(videoStream?.duration);
      }

      if (!duration || isNaN(duration)) {
        console.error("⚠️ FFprobe could not find duration. Full metadata:", JSON.stringify(metadata, null, 2));
        return reject(new Error(`Missing duration metadata in file: ${filePath}. (Likely a raw browser WebM recording)`));
      }

      resolve(duration);
    });
  });
};