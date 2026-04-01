// src/packages/remotion/src/components/Background.tsx
// This component is responsible for rendering the background of the video. It can either render a solid color (black) or an image if a source is provided.
import { AbsoluteFill, Img } from "remotion";

export const Background = ({ src }: { src?: string }) => {
  if (!src) {
    return <AbsoluteFill style={{ backgroundColor: "black" }} />;
  }

  return (
    <AbsoluteFill>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </AbsoluteFill>
  );
};
