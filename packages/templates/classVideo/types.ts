export type TimelineItem =
  | {
      type: "intro";
      durationInFrames: number;
    }
  | {
      type: "video";
      src: string;
      durationInFrames: number;
      playbackRate?: number;
    }
  | {
      type: "outro";
      src: string;
      durationInFrames: number;
    };

export type Timeline = {
  items: TimelineItem[];
  totalFrames: number;
};