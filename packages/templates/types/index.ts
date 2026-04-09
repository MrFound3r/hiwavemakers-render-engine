export type TimelineItem =
  | {
      type: "intro";
      durationInFrames: number;
      src?: string;
    }
  | {
      type: "video";
      src: string;
      durationInFrames: number;
      playbackRate?: number;
    }
  | {
      type: "outro";
      src?: string | null;
      durationInFrames: number;
    };

export type Timeline = {
  items: TimelineItem[];
  totalFrames: number;
};
