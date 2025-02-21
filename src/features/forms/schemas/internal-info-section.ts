import { content } from "$schemas";
import { uuidSchema } from "$schemas/uuid";
import { type InferOutput, nullish, object } from "valibot";

const updateSchema = object(
  {
    psudoId: uuidSchema,
    title: content,
    description: nullish(content),
  },
  "Should be an object",
);

export const schema = object(
  {
    title: content,
    description: nullish(content),
  },
  "Should be an object",
);

export type InfoSectionSchema = InferOutput<typeof schema>;
export type InfoSectionUpdateSchema = InferOutput<typeof updateSchema>;
