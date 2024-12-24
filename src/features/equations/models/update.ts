import { ValidationError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import { flatten, type InferOutput, object, pipe, safeParse, string, uuid } from "valibot";
import { createSchema } from "./create";

const updateSchema = pipe(
  object(
    {
      id: pipe(string(), uuid("The UUID is badly formatted.")),
      ...createSchema.entries,
    },
  ),
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
