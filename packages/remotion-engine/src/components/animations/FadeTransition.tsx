import { useCurrentFrame, interpolate } from "remotion";

export const FadeTransition: React.FC<{
  children: React.ReactNode;
  duration: number;
}> = ({ children, duration }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, duration],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  return <div style={{ opacity }}>{children}</div>;
};