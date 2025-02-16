import { ValidationError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import { content } from "$schemas";
import { uuidSchema } from "$schemas/uuid";
import { array, flatten, type InferOutput, minLength, nullish, object, pipe, safeParse } from "valibot";

export const schema = object(
  {
    id: uuidSchema,
    answer: content,
    explanation: nullish(content),
  },
  "Should be an object",
);

export const schemaCreate = object(
  {
    answer: content,
    explanation: nullish(content),
  },
  "Should be an object",
);

export const schemaUpdate = object(
  {
    id: nullish(uuidSchema),
    answer: content,
    explanation: nullish(content),
  },
  "Should be an object",
);

export const schemaArray = array(schema, "invalid 'Answer' array");

export const schemaCreateArray = (mLength = 0) =>
  pipe(array(schemaCreate, "invalid 'Answer' array"), minLength(mLength));

export const schemaUpdateArray = (mLength = 0) =>
  pipe(array(schemaUpdate, "invalid 'AnswerUpdate' array"), minLength(mLength));

export function validateSchema(data: unknown) {
  const d = safeParse(schema, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: AnswerIssues = flatten<typeof schema>(d.issues).nested ?? {};

  return Err(new ValidationError(issues));
}

// export function validateSchemaArray(data: unknown) {
//   const d = safeParse(schemaArray(0), data);

//   if (d.success) {
//     return Ok(d.output);
//   }

//   const issues: AnswerArrayIssues = flatten<ReturnType<typeof schemaArray>>(d.issues).nested ?? {};

//   return Err(new ValidationError(issues));
// }

export type Answer = InferOutput<typeof schema>;
export type PartialAnswer = Partial<Answer>;
export type AnswerArray = InferOutput<typeof schemaArray>;
export type AnswerCreate = InferOutput<typeof schemaCreate>;
export type AnswerUpdate = InferOutput<typeof schemaUpdate>;

export type AnswerIssues = ReturnType<typeof flatten<typeof schema>>["nested"];
export type AnswerArrayIssues = ReturnType<typeof flatten<typeof schemaArray>>["nested"];
