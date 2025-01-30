import { ValidationError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import { content } from "$schemas";
import { questionTypeSchema } from "$schemas/problems/self";
import { uuidArrayString } from "$schemas/uuid";
import { schemaArray as variableSchemaArray } from "$schemas/variable.svelte";
import { schemaUpdateArray as varientSchemaUpdateArray } from "$schemas/variant";
import { flatten, type InferOutput, nullish, object, pipe, safeParse, transform } from "valibot";

const updateSchema = pipe(
  object(
    {
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

export function validateUpdateSchema(data: unknown) {
  const d = safeParse(updateSchema, data);
  if (d.success) {
    return Ok(d.output);
  }

  const issues: UpdateIssues = flatten<typeof updateSchema>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}
