import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { INTRO_SENTENCE_OPTIONS, SECOND_SENTENCE_OPTIONS, THIRD_SENTENCE_OPTIONS } from "../consts";
import { pickDeterministic, replaceFirstName } from "../helpers";

type Props = {
  studentName: string;
  firstPhraseDurationInSeconds?: number;
  otherPhrasesDurationInSeconds?: number;
  gapBetweenPhrasesInSeconds?: number;
  phraseSeed?: string | number;
};

const sharedTextStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "center",
  lineHeight: 0.9,
  fontFamily: '"GillSansCustom", sans-serif',
  fontWeight: 700,
  WebkitTextStroke: "40px #333A73",
  paintOrder: "stroke fill",
  textShadow: `
    2px 0 #333A73,
    -2px 0 #333A73,
    0 2px #333A73,
    0 -2px #333A73,
    2px 2px #333A73,
    -2px -2px #333A73,
    2px -2px #333A73,
    -2px 2px #333A73,
    6px 6px 0 rgba(51, 58, 115, 0.35)
  `,
};

const topLineStyle: React.CSSProperties = {
  ...sharedTextStyle,
  color: "#FBA834",
  fontSize: 172,
  lineHeight: 0.9,
};

const nameLineStyle: React.CSSProperties = {
  ...sharedTextStyle,
  color: "#FFFFFF",
  fontSize: 284,
  lineHeight: 0.88,
  letterSpacing: "-0.01em",
};

const lineStyle: React.CSSProperties = {
  ...sharedTextStyle,
  color: "#FFFFFF",
  fontSize: 172,
  lineHeight: 0.9,
};

export const IntroPhrases: React.FC<Props> = ({
  studentName,
  firstPhraseDurationInSeconds = 4,
  otherPhrasesDurationInSeconds = 4,
  gapBetweenPhrasesInSeconds = 0,
  phraseSeed,
}) => {
  const { fps } = useVideoConfig();

  const firstPhraseDuration = Math.round(firstPhraseDurationInSeconds * fps);
  const otherPhraseDuration = Math.round(otherPhrasesDurationInSeconds * fps);
  const gapDuration = Math.round(gapBetweenPhrasesInSeconds * fps);

  const firstPhraseFrom = 0;
  const secondPhraseFrom = firstPhraseFrom + firstPhraseDuration + gapDuration;
  const thirdPhraseFrom = secondPhraseFrom + otherPhraseDuration + gapDuration;

  const baseSeed = String(phraseSeed ?? studentName ?? "intro-phrases");

  const introPhrase = pickDeterministic(INTRO_SENTENCE_OPTIONS, `${baseSeed}-intro`);

  const secondPhrase = pickDeterministic(SECOND_SENTENCE_OPTIONS, `${baseSeed}-second`);

  const thirdPhrase = pickDeterministic(THIRD_SENTENCE_OPTIONS, `${baseSeed}-third`);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: "25%",
        boxSizing: "border-box",
        pointerEvents: "none",
        position: "relative",
        zIndex: 99,
      }}>
      <div
        style={{
          width: "100%",
          maxWidth: 1400,
          paddingLeft: 48,
          paddingRight: 48,
          boxSizing: "border-box",
        }}>
        <Sequence
          from={firstPhraseFrom}
          durationInFrames={firstPhraseDuration}
          layout="none">
          <PhraseSlot>
            <FirstPhrase
              line1={replaceFirstName(introPhrase.line1, studentName)}
              line2={replaceFirstName(introPhrase.line2, studentName)}
            />
          </PhraseSlot>
        </Sequence>

        <Sequence
          from={secondPhraseFrom}
          durationInFrames={otherPhraseDuration}
          layout="none">
          <PhraseSlot>
            <AnimatedPhrase direction="left">
              <Phrase
                line1={secondPhrase.line1}
                line2={secondPhrase.line2}
              />
            </AnimatedPhrase>
          </PhraseSlot>
        </Sequence>

        <Sequence
          from={thirdPhraseFrom}
          durationInFrames={otherPhraseDuration}
          layout="none">
          <PhraseSlot>
            <AnimatedPhrase direction="right">
              <Phrase
                line1={thirdPhrase.line1}
                line2={thirdPhrase.line2}
              />
            </AnimatedPhrase>
          </PhraseSlot>
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};

const PhraseSlot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
      {children}
    </div>
  );
};

const AnimatedPhrase: React.FC<{
  children: React.ReactNode;
  direction: "left" | "right";
}> = ({ children, direction }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    fps,
    frame,
    durationInFrames: 22,
    config: {
      damping: 11,
      stiffness: 125,
      mass: 0.8,
    },
  });

  const startX = direction === "left" ? -260 : 260;
  const translateX = interpolate(entrance, [0, 1], [startX, 0]);
  const opacity = interpolate(entrance, [0, 0.2, 1], [0, 1, 1]);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        transform: `translateX(${translateX}px)`,
        opacity,
      }}>
      {children}
    </div>
  );
};

const FirstPhrase: React.FC<{
  line1: string;
  line2: string;
}> = ({ line1, line2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    fps,
    frame,
    durationInFrames: 22,
    config: {
      damping: 11,
      stiffness: 125,
      mass: 0.8,
    },
  });

  const titleX = interpolate(entrance, [0, 1], [220, 0]);
  const nameX = interpolate(entrance, [0, 1], [-220, 0]);
  const opacity = interpolate(entrance, [0, 0.15, 1], [0, 1, 1]);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity,
      }}>
      <div
        style={{
          ...topLineStyle,
          transform: `translateX(${titleX}px)`,
        }}>
        {line1}
      </div>

      <div
        style={{
          ...nameLineStyle,
          transform: `translateX(${nameX}px)`,
        }}>
        {line2}
      </div>
    </div>
  );
};

const Phrase: React.FC<{
  line1: string;
  line2: string;
}> = ({ line1, line2 }) => {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
      <div style={lineStyle}>{line1}</div>
      <div style={lineStyle}>{line2}</div>
    </div>
  );
};
