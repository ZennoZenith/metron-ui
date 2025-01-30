import { ValidationError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import {
  schemaArray as answerSchemaArray,
  schemaCreateArray as answerSchemaCreateArary,
  schemaUpdateArray as answerSchemaUpdateArary,
} from "$schemas/answer";
import type { Prettify } from "$type";
import { array, flatten, type InferOutput, minLength, nullish, object, pipe, safeParse } from "valibot";
import { uuidSchema } from "./uuid";
import { variableValueSchemaArray } from "./variable.svelte";

export const schemaCreate = object(
  {
    correctAnswers: answerSchemaCreateArary(1),
    incorrectAnswers: answerSchemaCreateArary(0),
    variableValues: variableValueSchemaArray,
  },
  "Should be an object",
);

export const schemaUpdate = object(
  {
    id: nullish(uuidSchema),
    correctAnswers: answerSchemaUpdateArary(1),
    incorrectAnswers: answerSchemaUpdateArary(0),
    variableValues: variableValueSchemaArray,
  },
  "Should be an object",
);

export const schema = object(
  {
    id: uuidSchema,
    correctAnswers: answerSchemaArray,
    incorrectAnswers: answerSchemaArray,
    variableValues: variableValueSchemaArray,
  },
  "Should be an object",
);

export const schemaArray = pipe(
  array(schema, "invalid 'Variant' array"),
  minLength(1, "Variant array length should be greater than 0"),
);

export const schemaCreateArray = (mLength: number = 0) =>
  pipe(array(schemaCreate, "invalid 'Variant' array"), minLength(mLength));

export const schemaUpdateArray = (mLength: number = 0) =>
  pipe(array(schemaUpdate, "invalid 'VariantUpdate' array"), minLength(mLength));

export function validateSchema(data: unknown) {
  const d = safeParse(schema, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: VariantIssues = flatten<typeof schema>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}

export function validateSchemaArray(data: unknown) {
  const d = safeParse(schemaArray, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: VariantArrayIssues = flatten<typeof schemaArray>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}

export type Variant = InferOutput<typeof schema>;
export type VariantCreate = InferOutput<typeof schemaCreate>;
export type VariantUpdate = InferOutput<typeof schemaUpdate>;
export type VariantArray = Prettify<[Variant, ...Variant[]]>;

export type VariantIssues = ReturnType<typeof flatten<typeof schema>>["nested"];
export type VariantArrayIssues = ReturnType<typeof flatten<typeof schemaArray>>["nested"];
