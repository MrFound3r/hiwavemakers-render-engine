import { useCurrentFrame, interpolate } from "remotion";

export const WipeTransition: React.FC<{
  children: React.ReactNode;
  duration: number;
}> = ({ children, duration }) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [0, duration], [0, 100], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        clipPath: `inset(0 ${100 - progress}% 0 0)`,
      }}>
      {children}
    </div>
  );
};
