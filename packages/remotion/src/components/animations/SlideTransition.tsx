import { useCurrentFrame, interpolate } from "remotion";

type Direction = "left" | "right" | "up" | "down";

export const SlideTransition: React.FC<{
  children: React.ReactNode;
  duration: number;
  direction?: Direction;
}> = ({ children, duration, direction = "left" }) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [0, duration], [1, 0], {
    extrapolateRight: "clamp",
  });

  const getTransform = () => {
    switch (direction) {
      case "left":
        return `translateX(${progress * 100}%)`;
      case "right":
        return `translateX(-${progress * 100}%)`;
      case "up":
        return `translateY(${progress * 100}%)`;
      case "down":
        return `translateY(-${progress * 100}%)`;
      default:
        return "translateX(0%)";
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        transform: getTransform(),
      }}>
      {children}
    </div>
  );
};
