import { ValidationError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import { uuidSchema } from "$schemas/uuid";
import { flatten, type InferOutput, object, pipe, safeParse, string, transform, uuid } from "valibot";
import { createSchema } from "./create";

const updateSchema = pipe(
  object(
    {
      id: uuidSchema,
      ...createSchema.entries,
    },
  ),
  transform(v => {
    return {
      ...v,
      tags: v.tags.length === 0 ? null : v.tags,
      equations: v.equations.length === 0 ? null : v.equations,
      images: v.images.length === 0 ? null : v.images,
      concepts: v.concepts.length === 0 ? null : v.concepts,
    };
  }),
);

export type UpdateSchema = InferOutput<typeof updateSchema>;
export type UpdateIssues = ReturnType<typeof flatten<typeof updateSchema>>["nested"];

export function validateUpdateSchema(data: unknown) {
  const d = safeParse(updateSchema, data);
  if (d.success) {
    return Ok(d.output);
  }

  const issues: UpdateIssues = flatten<typeof updateSchema>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}
