import type { FormDataValidationError, Superposition } from "$utils";
import { flatten, type InferOutput, object, pipe, safeParse, string, trim } from "valibot";

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

type SearchSchemaOutput = InferOutput<typeof searchSchema>;

export interface ValidationSearchError extends FormDataValidationError {
  search?: [string, ...string[]];
}

export function validateSearchSchema(data: unknown): Superposition<ValidationSearchError, SearchSchemaOutput> {
  const d = safeParse(searchSchema, data);
  if (d.success) {
    return { success: true, data: d.output };
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
