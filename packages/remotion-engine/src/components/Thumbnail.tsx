import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { INTRO_SENTENCE_OPTIONS } from "../consts";
import { pickDeterministic, replaceFirstName } from "../helpers";
import { TwoLinePhrase } from "../types";
import { FontPreloader } from "../FontPreloader";

type InputProps = {
  studentName: string;
  thumbnail?: {
    src: string;
  } | null;
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

export const Thumbnail: React.FC<InputProps> = ({ studentName, thumbnail, phraseSeed }) => {
  const baseSeed = String(phraseSeed ?? studentName ?? "thumbnail");
  const introPhrase = pickDeterministic<TwoLinePhrase>(INTRO_SENTENCE_OPTIONS, `${baseSeed}-intro`);
  const line1 = replaceFirstName(introPhrase.line1, studentName);
  const line2 = replaceFirstName(introPhrase.line2, studentName);

  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff" }}>
      <FontPreloader />

      {thumbnail?.src ? (
        <Img
          src={thumbnail.src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : null}

      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          zIndex: 999,
          paddingTop: "25%",
          boxSizing: "border-box",
          pointerEvents: "none",
        }}>
        <div
          style={{
            width: "100%",
            maxWidth: 1400,
            paddingLeft: 48,
            paddingRight: 48,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}>
          <div style={topLineStyle}>{line1}</div>
          <div style={nameLineStyle}>{line2}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
