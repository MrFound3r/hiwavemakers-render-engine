// src/packages/queue/types.ts
export interface VideoFragments {
  id: string;
  src: string;
  order: number;
}

export interface InputProps {
  studentName: string;
  className?: string;
  fragments: Array<VideoFragments>;
  outro: string;
  intro?: string;
  backgroundAudio?: {
    src: string;
    volume?: number;
  }
}

export type QueueJob = {
  id: string;
  compositionId: string;

  // Mode 2 (direct props)
  inputProps?: InputProps;

  status?: "pending" | "processing" | "done" | "failed";
};
