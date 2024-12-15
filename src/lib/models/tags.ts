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

const schema = pipe(
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

export type ParsedTagCreate = InferOutput<typeof schema>;
export interface ValidationError extends FormDataValidationError {
  title?: [string, ...string[]];
}

export function validateSchema(data: unknown): Superposition<ValidationError, ParsedTagCreate> {
  const d = safeParse(schema, data);
  if (d.success) {
    return { success: true, data: d.output as ParsedTagCreate };
  }

  const issues = flatten<typeof schema>(d.issues);

  return {
    success: false,
    httpCode: 400,
    error: {
      type: "VALIDATION",
      messages: ["Validation error"],
      data: {
        ...issues.nested,
      },
    },
  };
}

export type Tag = {
  id: string;
  title: string;
};
