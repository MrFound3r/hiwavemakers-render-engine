import { Composition } from "remotion";
import { ClassVideo } from "./compositions/ClassVideo/Composition";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="class-video-v1"
        component={ClassVideo}
        durationInFrames={300} // placeholder fallback
        defaultProps={{
          timeline: [],
        }}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
