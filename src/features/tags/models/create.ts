import type { FormDataValidationError, Superposition } from "$utils";
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

export interface ValidationError extends FormDataValidationError {
  title?: [string, ...string[]];
}
export function validateCreateSchema(data: unknown): Superposition<ValidationError, CreateSchema> {
  const d = safeParse(createSchema, data);
  if (d.success) {
    return { success: true, data: d.output };
  }

  const issues = flatten<typeof createSchema>(d.issues)["nested"];

  return {
    success: false,
    httpCode: 400,
    error: {
      type: "VALIDATION",
      messages: ["Validation error"],
      data: {
        ...issues,
      },
    },
  };
}
