// src/packages/remotion/src/components/Intro.tsx
import { AbsoluteFill, OffthreadVideo } from "remotion";
import { VideoFrame } from "./VideoFrame";

type IntroProps = {
  studentName: string;
  className?: string;
  backgroundSrc?: string;
};

export const Intro = ({ studentName, className, backgroundSrc }: IntroProps) => {
  return (
    <AbsoluteFill>
      {backgroundSrc && (
        <VideoFrame>
          <OffthreadVideo
            src={backgroundSrc}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </VideoFrame>
      )}

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          fontSize: 60,
          flexDirection: "column",
          textAlign: "center",
        }}>
        <div>Great Job</div>
        <div>{studentName}</div>
        {className && <div style={{ fontSize: 40 }}>{className}</div>}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
