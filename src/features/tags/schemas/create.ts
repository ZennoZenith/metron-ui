import { ValidationError } from "$lib/error";
import { Err, Ok, Result } from "$lib/superposition";
import { title } from "$schemas";
import { flatten, type InferOutput, object, safeParse } from "valibot";

export class CreateSchemaError extends ValidationError {
  constructor(issues: CreateIssues) {
    super(issues, "TagCreateSchemaError", "Tag create schema error");
  }
}

export const createSchema = object(
  {
    title,
  },
  "Should be an object",
);

export function validateCreateSchema(data: unknown): Result<CreateSchema, CreateSchemaError> {
  const d = safeParse(createSchema, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: CreateIssues = flatten<typeof createSchema>(d.issues)["nested"] ?? {};

  return Err(new CreateSchemaError(issues));
}

export type CreateSchema = InferOutput<typeof createSchema>;
export type CreateIssues = NonNullable<ReturnType<typeof flatten<typeof createSchema>>["nested"]>;
