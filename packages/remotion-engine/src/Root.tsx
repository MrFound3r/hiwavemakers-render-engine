import { Composition, Still, getInputProps } from "remotion";
import { ClassVideo } from "./compositions/ClassVideo/Composition";
import { Thumbnail } from "./components/Thumbnail";

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
        durationInFrames={300}
        defaultProps={{
          timeline: [],
          studentName: "Student Name",
          className: "Class Name",
          thumbnail: null,
        }}
        fps={fps}
        width={portraitWidth}
        height={portraitHeight}
      />

      <Composition
        id="class-video-v1-landscape"
        component={ClassVideo}
        durationInFrames={300}
        defaultProps={{
          timeline: [],
          studentName: "Student Name",
          className: "Class Name",
          thumbnail: null,
        }}
        fps={fps}
        width={landscapeWidth}
        height={landscapeHeight}
      />

      <Still
        id="class-video-v1-thumbnail-portrait"
        component={Thumbnail}
        defaultProps={{
          studentName: "Student Name",
          thumbnail: null,
        }}
        width={portraitWidth}
        height={portraitHeight}
      />

      <Still
        id="class-video-v1-thumbnail-landscape"
        component={Thumbnail}
        defaultProps={{
          studentName: "Student Name",
          thumbnail: null,
        }}
        width={landscapeWidth}
        height={landscapeHeight}
      />
    </>
  );
};