// packages/remotion-engine/src/components/Fonts.tsx
import { staticFile } from "remotion";

export const Fonts: React.FC = () => (
  <style>{`
    @font-face {
      font-family: "GillSansCustom";
      src: url("${staticFile("fonts/GillSans-ExtCondensed-Bold.ttf")}") format("truetype");
      font-weight: 700;
      font-style: normal;
      font-display: swap;
    }
  `}</style>
);
