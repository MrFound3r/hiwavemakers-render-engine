import { useMemo } from "react";
import { interpolate, useCurrentFrame, Html5Audio, Sequence } from "remotion";

interface BackgroundTrackProps {
  BASE_FPS: number;
  video: { duration: number };
  audio: { trackDuration: number; trackUrl: string };
  baseVolume?: number;
}

export default function BackgroundTrack({ BASE_FPS, video, audio, baseVolume = 0.4 }: BackgroundTrackProps) {
  const frame = useCurrentFrame();

  // --- End fade (last 2s) ---
  const fadeOutDuration = BASE_FPS * 2;
  const fadeOutStart = Math.max(0, video.duration - fadeOutDuration);
  const endFade = useMemo(() => {
    if (frame < fadeOutStart) return 1;
    return interpolate(frame, [fadeOutStart, video.duration], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }, [frame, fadeOutStart, video.duration]);

  const volume = baseVolume * endFade;

  // --- Loop the background audio across video duration ---
  const loopFrames = Math.max(1, Math.round(audio.trackDuration * BASE_FPS));
  const totalFrames = video.duration;
  const loopCount = Math.ceil(totalFrames / loopFrames);

  const tiles = useMemo(() => {
    return Array.from({ length: loopCount }, (_, i) => {
      const from = i * loopFrames;
      const remaining = totalFrames - from;
      return { from, segFrames: Math.min(loopFrames, remaining) };
    });
  }, [loopCount, loopFrames, totalFrames]);

  return (
    <>
      {tiles.map(({ from, segFrames }, idx) => (
        <Sequence
          key={idx}
          from={from}
          durationInFrames={segFrames}>
          <Html5Audio
            src={audio.trackUrl}
            volume={volume}
          />
        </Sequence>
      ))}
    </>
  );
}

// Use it like this on composition but need to precompute track duration in server and store in DB:
/**
 * 
 * {backgroundAudio && (
        <BackgroundTrack
          BASE_FPS={fps}
          video={{ duration: sequences.reduce((sum, { item }) => sum + item.durationInFrames, 0) }}
          audio={{ trackDuration: 1000, trackUrl: backgroundAudio.src }} // Placeholder trackDuration, as Html5Audio doesn't provide it
          baseVolume={backgroundAudio.volume ?? 0.2}
        />
      )}
 */
