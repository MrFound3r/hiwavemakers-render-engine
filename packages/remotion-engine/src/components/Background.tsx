// src/packages/remotion-engine/src/components/Background.tsx
// This component is responsible for rendering the background of the video. It can either render a solid color (black) or an image if a source is provided.

import { Video } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";

type BackgroundProps = {
  src?: string;
  isVideo?: boolean;
  durationInSeconds: number;
  muteVideo: boolean;

  animateImage?: boolean;

  // New explicit wiggle config
  wiggleEverySeconds?: number; // AE wiggle frequency period
  wiggleAmplitudePx?: number; // AE wiggle amplitude
  imageScale?: number; // optional override
};

const getWigglePoint = (src: string, index: number, axis: "x" | "y", amplitude: number) => {
  if (index <= 0) {
    return 0;
  }

  return (random(`${src}-${axis}-${index}`) * 2 - 1) * amplitude;
};

export const Background: React.FC<BackgroundProps> = ({
  src,
  isVideo,
  muteVideo,
  durationInSeconds,
  animateImage = true,
  wiggleEverySeconds = 1,
  wiggleAmplitudePx = 27,
  imageScale,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps, width, height } = useVideoConfig();

  if (!src) {
    return <AbsoluteFill style={{ backgroundColor: "black" }} />;
  }

  if (isVideo) {
    const videoDurationInFrames = Math.max(1, Math.round(durationInSeconds * fps));

    const loopCount = Math.ceil(durationInFrames / videoDurationInFrames);

    return (
      <AbsoluteFill>
        {Array.from({ length: loopCount }).map((_, i) => {
          const from = i * videoDurationInFrames;
          const remaining = durationInFrames - from;
          const segmentDuration = Math.min(videoDurationInFrames, remaining);

          return (
            <Sequence
              key={i}
              from={from}
              durationInFrames={segmentDuration}>
              <Video
                src={src}
                muted={muteVideo}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Sequence>
          );
        })}
      </AbsoluteFill>
    );
  }

  const stepFrames = Math.max(1, Math.round(wiggleEverySeconds * fps));
  const segmentIndex = Math.floor(frame / stepFrames);
  const segmentStartFrame = segmentIndex * stepFrames;
  const localProgress = (frame - segmentStartFrame) / stepFrames;

  const easedProgress = Easing.inOut(Easing.ease)(localProgress);

  const fromX = getWigglePoint(src, segmentIndex, "x", wiggleAmplitudePx);
  const toX = getWigglePoint(src, segmentIndex + 1, "x", wiggleAmplitudePx);

  const fromY = getWigglePoint(src, segmentIndex, "y", wiggleAmplitudePx);
  const toY = getWigglePoint(src, segmentIndex + 1, "y", wiggleAmplitudePx);

  const translateX = animateImage
    ? interpolate(easedProgress, [0, 1], [fromX, toX], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  const translateY = animateImage
    ? interpolate(easedProgress, [0, 1], [fromY, toY], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // Enough overscan to hide edges while moving ±27px
  const autoScale = 1 + (wiggleAmplitudePx * 2) / Math.min(width, height) + 0.01;

  return (
    <AbsoluteFill>
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `translate(${translateX}px, ${translateY}px) scale(${imageScale ?? autoScale})`,
          transformOrigin: "center center",
        }}>
        <Img
          src={src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
