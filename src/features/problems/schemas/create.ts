import { ValidationError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import { content } from "$schemas";
import { questionTypeSchema } from "$schemas/problems/self";
import { uuidArrayString } from "$schemas/uuid";
import { schemaArray as variableSchemaArray } from "$schemas/variable.svelte";
import { schemaCreateArray as varientSchemaCreateArray } from "$schemas/variant";
import { flatten, type InferOutput, nullish, object, pipe, safeParse, transform } from "valibot";

// scalar type QuestionType extending enum<MCQ, MCA, Binary, FillBlank, Matching>;

export const createSchema = pipe(
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
      variants: varientSchemaCreateArray(1),
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
