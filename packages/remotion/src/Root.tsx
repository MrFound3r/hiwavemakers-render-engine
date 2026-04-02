// src/packages/remotion/src/Root.tsx
import { Composition, getInputProps } from "remotion";
import { ClassVideo } from "./compositions/ClassVideo/Composition";

export const RemotionRoot = () => {
  const inputProps = getInputProps();

  const fps = Number(inputProps.fps) || 30;
  const portraitWidth = Number(inputProps.portraitWidth) || 1080;
  const portraitHeight = Number(inputProps.portraitHeight) || 1920;
  const landscapeWidth = Number(inputProps.landscapeWidth) || 1920;
  const landscapeHeight = Number(inputProps.landscapeHeight) || 1080;

  return (
    <>
      <Composition
        id="class-video-v1-portrait"
        component={ClassVideo}
        durationInFrames={300} // placeholder fallback
        defaultProps={{
          timeline: [],
          studentName: "Student Name",
          className: "Class Name",
        }}
        fps={fps}
        width={portraitWidth}
        height={portraitHeight}
      />
      <Composition
        id="class-video-v1-landscape"
        component={ClassVideo}
        durationInFrames={300} // placeholder fallback
        defaultProps={{
          timeline: [],
          studentName: "Student Name",
          className: "Class Name",
        }}
        fps={fps}
        width={landscapeWidth}
        height={landscapeHeight}
      />
    </>
  );
};
