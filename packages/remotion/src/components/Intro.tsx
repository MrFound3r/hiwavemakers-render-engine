import { AbsoluteFill } from "remotion";

export const Intro = ({
  studentName,
  className,
}: {
  studentName: string;
  className: string;
}) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
        color: "white",
        fontSize: 60,
        flexDirection: "column",
      }}
    >
      <div>{studentName}</div>
      <div style={{ fontSize: 40 }}>{className}</div>
    </AbsoluteFill>
  );
};