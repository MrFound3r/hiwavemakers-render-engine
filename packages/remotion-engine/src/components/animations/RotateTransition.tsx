import { useCurrentFrame, interpolate } from "remotion";

export const RotateTransition: React.FC<{
  children: React.ReactNode;
  duration: number;
}> = ({ children, duration }) => {
  const frame = useCurrentFrame();

  const rotate = interpolate(frame, [0, duration], [-5, 0], {
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
        transform: `rotate(${rotate}deg)`,
        opacity,
      }}>
      {children}
    </div>
  );
};
