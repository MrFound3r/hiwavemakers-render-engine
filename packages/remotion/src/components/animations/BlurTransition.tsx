import { useCurrentFrame, interpolate } from "remotion";

export const BlurTransition: React.FC<{
  children: React.ReactNode;
  duration: number;
}> = ({ children, duration }) => {
  const frame = useCurrentFrame();

  const blur = interpolate(frame, [0, duration], [20, 0], {
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(frame, [0, duration], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        filter: `blur(${blur}px)`,
        opacity,
      }}>
      {children}
    </div>
  );
};
