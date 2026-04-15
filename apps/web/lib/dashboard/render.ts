// apps/web/lib/dashboard/render.ts
import type { RenderFragment, Student } from "@/types/dashboard";
import { DEFAULT_COMPOSITION_ID, DEFAULT_OUTRO_URL } from "./consts";
import { API_BASE_URL } from "../consts";

export function buildRenderFragments(student: Student): RenderFragment[] {
  return (student.videos || []).map((videoUrl, index) => ({
    id: `f${index + 1}`,
    order: index + 1,
    src: `${API_BASE_URL}${videoUrl}`,
  }));
}

export function buildRenderPayload(student: Student) {
  return [
    {
      compositionId: DEFAULT_COMPOSITION_ID,
      inputProps: {
        studentName: student.name,
        fragments: buildRenderFragments(student),
        outro: DEFAULT_OUTRO_URL,       
      },
    },
  ];
}
