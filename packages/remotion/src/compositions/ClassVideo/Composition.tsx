import { Intro } from "../../components/Intro";
import { Sequence, OffthreadVideo, AbsoluteFill } from "remotion";

type TimelineItem =
  | { type: "intro"; durationInFrames: number }
  | {
      type: "video";
      src: string;
      durationInFrames: number;
      playbackRate?: number;
    }
  | {
      type: "outro";
      src: string;
      durationInFrames: number;
    };

export const ClassVideo = ({
  timeline,
  studentName,
  className,
}: {
  timeline: TimelineItem[];
  studentName: string;
  className: string;
}) => {
  let currentFrame = 0;

  return (
    <AbsoluteFill>
      {timeline.map((item, index) => {
        const start = currentFrame;
        currentFrame += item.durationInFrames;

        if (item.type === "intro") {
          return (
            <Sequence
              key={index}
              from={start}
              durationInFrames={item.durationInFrames}>
              <Intro
                studentName={studentName}
                className={className}
              />
            </Sequence>
          );
        }

        if (item.type === "video") {
          return (
            <Sequence
              key={index}
              from={start}
              durationInFrames={item.durationInFrames}>
              <OffthreadVideo
                src={item.src}
                playbackRate={item.playbackRate || 1}
              />
            </Sequence>
          );
        }

        if (item.type === "outro") {
          return (
            <Sequence
              key={index}
              from={start}
              durationInFrames={item.durationInFrames}>
              <OffthreadVideo src={item.src} />
            </Sequence>
          );
        }

        return null;
      })}
    </AbsoluteFill>
  );
};
