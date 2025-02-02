import { ValidationError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import { schemaCreateArray as answerSchemaCreateArary } from "$schemas/answer";

import { variableValueSchemaArray } from "$schemas/variable.svelte";
import { array, flatten, type InferOutput, minLength, object, pipe, safeParse } from "valibot";

export const createSchema = object(
  {
    correctAnswers: answerSchemaCreateArary(1),
    incorrectAnswers: answerSchemaCreateArary(0),
    variableValues: variableValueSchemaArray,
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

export type VariantCreate = InferOutput<typeof createSchema>;

export const schemaCreateArray = (mLength: number = 0) =>
  pipe(array(createSchema, "invalid 'Variant' array"), minLength(mLength));
