// packages/remotion-engine/src/compositions/ClassVideo/Composition.tsx
import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";

import { Intro } from "../../components/Intro";
import { VideoFrame } from "../../components/VideoFrame";
import { Background } from "../../components/Background";
import BackgroundTrack from "../../components/BackgroundTrack";
import { IntroPhrases } from "../../components/IntroPhrases";
import { FontPreloader } from "../../FontPreloader";
import { Logo } from "../../components/Logo";
import { OverShootTransition } from "../../components/animations/OvershootTransition";
import { FadeTransition } from "../../components/animations/FadeTransition";

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
      src?: string | null;
      durationInFrames: number;
    };

type InputProps = {
  timeline: TimelineItem[];
  studentName: string;
  className?: string;
  backgroundAudio?: {
    src: string;
    durationInSeconds: number;
    volume?: number;
  };
  background?: {
    src: string;
    isVideo: boolean;
    durationInSeconds: number;
  } | null;
};

export const ClassVideo: React.FC<InputProps> = ({ timeline, studentName, className, backgroundAudio, background }) => {
  const { fps } = useVideoConfig();
  const TRANSITION_DURATION = 15;

  const sequences = timeline.map((item, index) => {
    const start = timeline.slice(0, index).reduce((sum, current) => sum + current.durationInFrames, 0);

    return { item, start, index };
  });

  const totalDurationInFrames = timeline.reduce((sum, item) => sum + item.durationInFrames, 0);

  const outroIndex = timeline.findIndex((item) => item.type === "outro" && Boolean(item.src));

  const rawOutroStart =
    outroIndex === -1
      ? totalDurationInFrames
      : timeline.slice(0, outroIndex).reduce((sum, item) => sum + item.durationInFrames, 0);

  // Hide the logo as soon as the outro transition starts
  const logoVisibleDurationInFrames =
    outroIndex === -1
      ? totalDurationInFrames
      : Math.max(0, rawOutroStart - (outroIndex === 0 ? 0 : TRANSITION_DURATION));

  const muteVideo = Boolean(backgroundAudio);

  return (
    <AbsoluteFill>
      <FontPreloader />
      <Background
        src={background?.src}
        durationInSeconds={background?.durationInSeconds ?? 0}
        muteVideo={muteVideo}
        isVideo={background?.isVideo}
        animateImage={true}
        wiggleEverySeconds={1}
        wiggleAmplitudePx={27}
      />

      {backgroundAudio ? (
        <BackgroundTrack
          BASE_FPS={fps}
          video={{ duration: totalDurationInFrames }}
          audio={{
            trackDuration: backgroundAudio.durationInSeconds,
            trackUrl: backgroundAudio.src,
          }}
          baseVolume={backgroundAudio.volume ?? 0.2}
        />
      ) : null}

      <IntroPhrases
        studentName={studentName}
        firstPhraseDurationInSeconds={6}
        otherPhrasesDurationInSeconds={7}
        gapBetweenPhrasesInSeconds={1}
      />

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
              <OverShootTransition
                duration={5}
                direction="left">
                <VideoFrame>
                  <Video
                    src={item.src}
                    playbackRate={item.playbackRate ?? 1}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </VideoFrame>
              </OverShootTransition>
            </Sequence>
          );
        }

        if (item.type === "outro" && item.src) {
          return (
            <Sequence
              key={index}
              from={from}
              durationInFrames={duration}>
              <FadeTransition duration={TRANSITION_DURATION}>
                <VideoFrame>
                  <Video src={item.src} />
                </VideoFrame>
              </FadeTransition>
            </Sequence>
          );
        }

        return null;
      })}

      {logoVisibleDurationInFrames > 0 ? (
        <Sequence
          from={0}
          durationInFrames={logoVisibleDurationInFrames}
          layout="none">
          <Logo
            wiggleEverySeconds={1}
            wiggleAmplitudePx={20}
          />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
