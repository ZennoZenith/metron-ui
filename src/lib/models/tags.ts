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

const createSchema = pipe(
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
export type ParsedTagCreate = InferOutput<typeof createSchema>;

const searchSchema = pipe(
  object(
    {
      search: pipe(
        string("search should be string"),
        trim(),
      ),
    },
  ),
);

export type ParsedTagSearch = InferOutput<typeof searchSchema>;

export interface ValidationError extends FormDataValidationError {
  title?: [string, ...string[]];
}

export interface ValidationSearchError extends FormDataValidationError {
  search?: [string, ...string[]];
}

export function validateCreateSchema(data: unknown): Superposition<ValidationError, ParsedTagCreate> {
  const d = safeParse(createSchema, data);
  if (d.success) {
    return { success: true, data: d.output as ParsedTagCreate };
  }

  const issues = flatten<typeof createSchema>(d.issues);

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

export function validateSearchSchema(data: unknown): Superposition<ValidationSearchError, ParsedTagSearch> {
  const d = safeParse(searchSchema, data);
  if (d.success) {
    return { success: true, data: d.output as ParsedTagSearch };
  }

  const issues = flatten<typeof searchSchema>(d.issues);

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
