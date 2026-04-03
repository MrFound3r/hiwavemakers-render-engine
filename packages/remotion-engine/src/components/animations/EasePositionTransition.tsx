import { useCurrentFrame } from "remotion";

type Direction = "left" | "right" | "up" | "down";

export const EasePositionTransition: React.FC<{
  children: React.ReactNode;
  duration: number;
  direction?: Direction;
}> = ({
  children,
  duration,
  direction = "left",
}) => {
  const frame = useCurrentFrame();

  const t = Math.min(frame / duration, 1);

  // cubic ease-out
  const eased = 1 - Math.pow(1 - t, 3);

  const getTransform = () => {
    const value = (1 - eased) * 100;

    switch (direction) {
      case "left":
        return `translateX(${value}%)`;
      case "right":
        return `translateX(-${value}%)`;
      case "up":
        return `translateY(${value}%)`;
      case "down":
        return `translateY(-${value}%)`;
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
      }}
    >
      {children}
    </div>
  );
};