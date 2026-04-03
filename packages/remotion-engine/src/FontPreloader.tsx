// packages/remotion-engine/src/FontPreloader.tsx
import { useEffect } from "react";
import { delayRender, continueRender } from "remotion";
import { Fonts } from "./components/Fonts";
/* =============================== FONT PRELOADER (ensures fonts load before rendering) =============================== */
export const FontPreloader: React.FC = () => {
  const handle = delayRender("Fonts");
  useEffect(() => {
    document.fonts.ready.then(() => continueRender(handle));
  }, [handle]);
  return <Fonts />;
};
