// /apps/web/types/dashboard.ts

export interface Student {
  id: number;
  room_uuid: string;
  student_uuid: string;
  name: string;
  email: string | null;
  videos: string[];
  created_at: string;

  render_id: string | null;
  render_status: string | null;
  render_progress: number | null;
  render_url: string | null;
  render_thumbnail: string | null;
  render_error: string | null;
  render_attempts: number | null;
  render_max_attempts: number | null;
  render_cancelled: boolean | null;
}

export interface Room {
  room_uuid: string;
}

export interface RenderFragment {
  id: string;
  order: number;
  src: string;
}
