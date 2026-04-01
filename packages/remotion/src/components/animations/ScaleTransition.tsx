import { useCurrentFrame, interpolate } from "remotion";

export const ScaleTransition: React.FC<{
  children: React.ReactNode;
  duration: number;
}> = ({ children, duration }) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, duration], [0.8, 1], {
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
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {children}
    </div>
  );
};