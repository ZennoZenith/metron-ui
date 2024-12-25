import { ValidationError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import { uuidSchema } from "$schemas/uuid";
import { flatten, type InferOutput, object, safeParse } from "valibot";
import { createSchema } from "./create";

const updateSchema = object(
  {
    id: uuidSchema(),
    ...createSchema.entries,
  },
  "Should be an object",
);

export function validateUpdateSchema(data: unknown) {
  const d = safeParse(updateSchema, data);
  if (d.success) {
    return Ok(d.output);
  }

  const issues: UpdateIssues = flatten<typeof updateSchema>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}

export type UpdateSchema = InferOutput<typeof updateSchema>;
export type UpdateIssues = ReturnType<typeof flatten<typeof updateSchema>>["nested"];
