// src/packages/video-utils/getVideoDuration.ts
import ffmpeg from "fluent-ffmpeg";
import ffprobe from "ffprobe-static";

ffmpeg.setFfprobePath(ffprobe.path);

export const getVideoDurationInSeconds = (filePath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(err);
      }

      const duration = metadata.format?.duration;

      if (!duration) {
        return reject(new Error(`Could not determine duration for ${filePath}`));
      }

      resolve(duration);
    });
  });
};