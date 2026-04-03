// src/packages/remotion-engine/src/components/Intro.tsx
import { AbsoluteFill } from "remotion";
import { VideoFrame } from "./VideoFrame";
import { Video } from "@remotion/media";

type IntroProps = {
  studentName: string;
  className?: string;
  backgroundSrc?: string;
};

export const Intro = ({ backgroundSrc }: IntroProps) => {
  return (
    <AbsoluteFill>
      {backgroundSrc && (
        <VideoFrame>
          <Video
            src={backgroundSrc}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </VideoFrame>
      )}
    </AbsoluteFill>
  );
};
