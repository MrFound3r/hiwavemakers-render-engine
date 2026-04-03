// packages/remotion/src/components/animations/OvershootTransition.tsx
import { useCurrentFrame } from "remotion";

type Direction = "left" | "right" | "up" | "down";

export const OverShootTransition: React.FC<{
  children: React.ReactNode;
  duration: number;
  direction?: Direction;
  intensity?: number; // controls overshoot amount
}> = ({
  children,
  duration,
  direction = "left",
  intensity = 1,
}) => {
  const frame = useCurrentFrame();

  const t = Math.min(frame / duration, 1);

  // easeOutBack curve (classic overshoot)
  const overshoot = 1.70158 * intensity;

  const eased =
    1 +
    overshoot * Math.pow(t - 1, 3) +
    overshoot * Math.pow(t - 1, 2);

  // map to movement
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