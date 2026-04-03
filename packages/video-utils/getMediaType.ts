import ffmpeg from "fluent-ffmpeg";
import ffprobe from "ffprobe-static";

ffmpeg.setFfprobePath(ffprobe.path);

export type MediaType = "image" | "video" | "audio" | "unknown";

export const getMediaType = (filePath: string): Promise<MediaType> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(err);
      }

      const streams = metadata.streams || [];

      const hasVideoStream = streams.some((s) => s.codec_type === "video");

      const hasAudioStream = streams.some((s) => s.codec_type === "audio");

      // Logic:
      // - video stream + duration → video
      // - audio stream only → audio
      // - single-frame video (no duration) → image

      const duration = metadata.format?.duration;

      if (hasVideoStream && duration && duration > 0.1) {
        return resolve("video");
      }

      if (hasAudioStream && !hasVideoStream) {
        return resolve("audio");
      }

      if (hasVideoStream && (!duration || duration <= 0.1)) {
        return resolve("image");
      }

      return resolve("unknown");
    });
  });
};
