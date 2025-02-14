import { schemaUpdateArray as answerSchemaUpdateArary } from "$api/schemas/answer";
import { variableValueSchemaArray } from "$api/schemas/variable";
import { ValidationError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import { uuidSchema } from "$schemas/uuid";
import { array, flatten, type InferOutput, minLength, nullish, object, pipe, safeParse } from "valibot";

export const updateSchema = object(
  {
    id: nullish(uuidSchema),
    correctAnswers: answerSchemaUpdateArary(1),
    incorrectAnswers: answerSchemaUpdateArary(0),
    variableValues: variableValueSchemaArray,
  },
  "Should be an object",
);

export type VariantUpdate = InferOutput<typeof updateSchema>;
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

export const schemaUpdateArray = (mLength: number = 0) =>
  pipe(array(updateSchema, "invalid 'VariantUpdate' array"), minLength(mLength));
