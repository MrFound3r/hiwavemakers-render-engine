import { z } from "zod";

export const RenderRequestFromPropsSchema = z.object({
  compositionId: z.string(),
  inputProps: z.object({
    outro: z.string().optional(),
    intro: z.string().optional(),
    thumbnail: z
      .object({
        src: z.string(),
      })
      .optional(),
    background: z
      .object({
        src: z.string(),
      })
      .optional(),
    backgroundAudio: z
      .object({
        src: z.string(),
        volume: z.number().optional(),
      })
      .optional(),
    studentName: z.string(),
    className: z.string().optional(),
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
