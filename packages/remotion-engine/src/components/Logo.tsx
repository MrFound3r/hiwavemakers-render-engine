// packages/remotion-engine/src/components/Logo.tsx
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type LogoProps = {
  left?: string | number;
  bottom?: string | number;
  width?: number;
  animate?: boolean;
  wiggleEverySeconds?: number;
  wiggleAmplitudePx?: number;
};

const getWigglePoint = (
  seed: string,
  index: number,
  axis: "x" | "y",
  amplitude: number
) => {
  if (index <= 0) {
    return 0;
  }

  return (random(`${seed}-${axis}-${index}`) * 2 - 1) * amplitude;
};

export const Logo: React.FC<LogoProps> = ({
  left = "15%",
  bottom = "12%",
  width = "100%",
  animate = true,
  wiggleEverySeconds = 1,
  wiggleAmplitudePx = 27,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stepFrames = Math.max(1, Math.round(wiggleEverySeconds * fps));
  const segmentIndex = Math.floor(frame / stepFrames);
  const segmentStartFrame = segmentIndex * stepFrames;
  const localProgress = (frame - segmentStartFrame) / stepFrames;
  const easedProgress = Easing.inOut(Easing.ease)(localProgress);

  const seed = "logo-shapes";

  const fromX = getWigglePoint(seed, segmentIndex, "x", wiggleAmplitudePx);
  const toX = getWigglePoint(seed, segmentIndex + 1, "x", wiggleAmplitudePx);

  const fromY = getWigglePoint(seed, segmentIndex, "y", wiggleAmplitudePx);
  const toY = getWigglePoint(seed, segmentIndex + 1, "y", wiggleAmplitudePx);

  const translateX = animate
    ? interpolate(easedProgress, [0, 1], [fromX, toX], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  const translateY = animate
    ? interpolate(easedProgress, [0, 1], [fromY, toY], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left,
          bottom,
          transform: `translate(${translateX}px, ${translateY}px)`,
          transformOrigin: "center center",
        }}
      >
        <Img
          src={staticFile("images/shapes.png")}
          style={{
            width,
            height: "auto",
            display: "block",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};