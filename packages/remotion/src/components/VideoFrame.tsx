// components/VideoFrame.tsx
import { AbsoluteFill } from "remotion";

export const VideoFrame = ({ children }: { children: React.ReactNode }) => {
  return (
    <AbsoluteFill>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <div
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
          }}>
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};
