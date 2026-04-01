// src/packages/remotion/src/compositions/classVideo/Composition.tsx
import { Sequence, OffthreadVideo, AbsoluteFill, Html5Audio } from "remotion";
import { Intro } from "../../components/Intro";
import { VideoFrame } from "../../components/VideoFrame";
import { FadeTransition } from "../../components/animations/FadeTransition";
import { Background } from "../../components/Background";

type TimelineItem =
  | { type: "intro"; src?: string; durationInFrames: number }
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

type InputProps = {
  timeline: TimelineItem[];
  studentName: string;
  className?: string;
  backgroundAudio?: {
    src: string;
    volume?: number;
  };
  backgroundSrc?: string;
};

export const ClassVideo = ({ timeline, studentName, className, backgroundAudio, backgroundSrc }: InputProps) => {
  const sequences = timeline.map((item, index) => {
    const start = timeline.slice(0, index).reduce((sum, i) => sum + i.durationInFrames, 0);

    return { item, start, index };
  });
  const TRANSITION_DURATION = 15;

  return (
    <AbsoluteFill>
      <Background src={backgroundSrc} />

      {backgroundAudio && (
        <Html5Audio
          src={backgroundAudio.src}
          volume={backgroundAudio.volume ?? 0.2}
        />
      )}

      {sequences.map(({ item, start, index }) => {
        const isFirst = index === 0;

        const from = isFirst ? start : start - TRANSITION_DURATION;
        const duration = item.durationInFrames + (isFirst ? 0 : TRANSITION_DURATION);

        if (item.type === "intro") {
          return (
            <Sequence
              key={index}
              from={start}
              durationInFrames={item.durationInFrames}>
              <FadeTransition duration={TRANSITION_DURATION}>
                <Intro
                  studentName={studentName}
                  className={className}
                  backgroundSrc={item.src}
                />
              </FadeTransition>
            </Sequence>
          );
        }

        if (item.type === "video") {
          return (
            <Sequence
              key={index}
              from={from}
              durationInFrames={duration}>
              <FadeTransition duration={TRANSITION_DURATION}>
                <VideoFrame>
                  <OffthreadVideo
                    src={item.src}
                    playbackRate={item.playbackRate || 1}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </VideoFrame>
              </FadeTransition>
            </Sequence>
          );
        }

        if (item.type === "outro") {
          return (
            <Sequence
              key={index}
              from={from}
              durationInFrames={duration}>
              <FadeTransition duration={TRANSITION_DURATION}>
                <VideoFrame>
                  <OffthreadVideo
                    src={item.src}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </VideoFrame>
              </FadeTransition>
            </Sequence>
          );
        }

        return null;
      })}
    </AbsoluteFill>
  );
};
