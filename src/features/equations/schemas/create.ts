import { ValidationError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import { content, title } from "$schemas";
import { tagsStringSchema } from "$schemas/tags/self";
import { flatten, type InferOutput, object, optional, safeParse } from "valibot";

export const createSchema = object(
  {
    title: title(),
    description: optional(content()),
    content: content(),
    tags: optional(tagsStringSchema),
  },
  "Should be an object",
);

export function validateCreateSchema(data: unknown) {
  const d = safeParse(createSchema, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: CreateIssues = flatten<typeof createSchema>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}

export type CreateSchema = InferOutput<typeof createSchema>;
export type CreateIssues = ReturnType<typeof flatten<typeof createSchema>>["nested"];
