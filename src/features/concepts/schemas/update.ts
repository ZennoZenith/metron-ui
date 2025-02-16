import { ValidationError } from "$lib/error";
import { Err, Ok, type Result } from "$lib/superposition";
import { uuidSchema } from "$schemas/uuid";
import { flatten, type InferOutput, object, pipe, safeParse, transform } from "valibot";
import { createSchema } from "./create";

export class UpdateSchemaError extends ValidationError {
  constructor(issues: UpdateIssues = {}) {
    super(issues, "ConceptUpdateSchemaError", "Concept update schema error");
  }
}

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

export function validateUpdateSchema(data: unknown): Result<UpdateSchema, UpdateSchemaError> {
  const d = safeParse(updateSchema, data);
  if (d.success) {
    return Ok(d.output);
  }

  const issues: UpdateIssues = flatten<typeof updateSchema>(d.issues).nested ?? {};

  return Err(new UpdateSchemaError(issues));
}

export type ConceptUpdate = UpdateSchema;
