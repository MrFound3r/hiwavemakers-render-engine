import { useCurrentFrame, interpolate } from "remotion";

export const GaussianBlurTransition: React.FC<{
  children: React.ReactNode;
  duration: number;
  maxBlur?: number;
}> = ({ children, duration, maxBlur = 20 }) => {
  const frame = useCurrentFrame();

  const progress = Math.min(frame / duration, 1);

  const blur = interpolate(progress, [0, 1], [maxBlur, 0]);
  const opacity = interpolate(progress, [0, 1], [0.7, 1]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        filter: `blur(${blur}px)`,
        opacity,
      }}
    >
      {children}
    </div>
  );
};