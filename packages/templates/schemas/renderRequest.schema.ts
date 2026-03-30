import { z } from "zod";

export const RenderRequestFromPropsSchema = z.object({
  compositionId: z.string(),
  inputProps: z.object({
    outro: z.string(),
    studentName: z.string(),
    className: z.string(),
    fragments: z.array(
      z.object({
        id: z.string(),
        src: z.string(),
        order: z.number(),
      }),
    ),
  }),
});

export const BatchRenderFromPropsSchema = z.array(RenderRequestFromPropsSchema);
