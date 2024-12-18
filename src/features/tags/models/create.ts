import { ValidationError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import { BAD_REQUEST } from "$utils/http-codes";
import {
  flatten,
  type InferOutput,
  maxLength,
  minLength,
  nonEmpty,
  object,
  pipe,
  safeParse,
  string,
  trim,
} from "valibot";

export const createSchema = pipe(
  object(
    {
      title: pipe(
        string("title should be string"),
        trim(),
        nonEmpty("title shoud not be empty"),
        minLength(3, "title length should be between 3 and 150"),
        maxLength(150, "title length should be between 3 and 150"),
      ),
    },
  ),
);
export type CreateSchema = InferOutput<typeof createSchema>;

export function validateCreateSchema(data: unknown) {
  const d = safeParse(createSchema, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues = flatten<typeof createSchema>(d.issues)["nested"] ?? {};

  return Err(new ValidationError({ httpCode: BAD_REQUEST, issues }).error);
}
