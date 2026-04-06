import { InputProps } from "@queue/types";

export interface RenderJob {
  inputProps: InputProps;
  compositionId: string;
  id: string;
}

// export type QueueStatus = "pending" | "processing" | "done" | "failed";

// export interface QueueJob {
//   id: string;
//   composition_id: string;
//   status: string;
//   input: string;
//   output_path: string;
//   error: string;
//   created_at: string;
//   updated_at: string;
// }

export interface RenderInstance {
  id: string;
  composition_id: string;
  status: string;
  input: string;
  output_path: string;
  error: string;
  created_at: string;
  updated_at: string;
  attempts: number;
  max_attempts: number;
  cancelled: boolean;
  progress: number;
}