import { questionTypeSchema } from "$api/schemas/problems";
import { schemaArray as variableSchemaArray } from "$api/schemas/variable";
import { schemaUpdateArray as varientSchemaUpdateArray } from "$features/variants/schemas/update";
import { ValidationError } from "$lib/error";
import { Err, Ok, Result } from "$lib/superposition";
import { content } from "$schemas";
import { uuidArrayString, uuidSchema } from "$schemas/uuid";
import { flatten, type InferOutput, nullish, object, pipe, safeParse, transform } from "valibot";

export class UpdateSchemaError extends ValidationError {
  constructor(issues: UpdateIssues = {}) {
    super(issues, "ProblemUpdateSchemaError", "Problem update schema error");
  }
}

const updateSchema = pipe(
  object(
    {
      id: uuidSchema,
      problemStatement: content,
      hint: nullish(content),
      questionType: questionTypeSchema,
      tags: nullish(uuidArrayString, ""),
      equations: nullish(uuidArrayString, ""),
      images: nullish(uuidArrayString, ""),
      concepts: nullish(uuidArrayString, ""),
      problems: nullish(uuidArrayString, ""),
      variables: nullish(variableSchemaArray),
      variants: varientSchemaUpdateArray(1),
      explanation: nullish(content),
    },
  ),
  transform(v => {
    return {
      ...v,
      tags: v.tags.length === 0 ? null : v.tags,
      equations: v.equations.length === 0 ? null : v.equations,
      images: v.images.length === 0 ? null : v.images,
      concepts: v.concepts.length === 0 ? null : v.concepts,
      problems: v.problems.length === 0 ? null : v.problems,
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

  const issues: UpdateIssues = flatten<typeof updateSchema>(d.issues)["nested"] ?? {};

  return Err(new UpdateSchemaError(issues));
}
