import type { FormDataValidationError, Superposition } from "$utils";
import { flatten, type InferOutput, object, pipe, safeParse, string, uuid } from "valibot";
import { createSchema } from "./create";

const updateSchema = pipe(
  object(
    {
      id: pipe(string(), uuid("The UUID is badly formatted.")),
      ...createSchema.entries,
    },
  ),
);

export type UpdateSchema = InferOutput<typeof updateSchema>;
export interface ValidationUpdateError extends FormDataValidationError {
  id?: [string, ...string[]];
  title?: [string, ...string[]];
}

export function validateUpdateSchema(data: unknown): Superposition<ValidationUpdateError, UpdateSchema> {
  const d = safeParse(updateSchema, data);
  if (d.success) {
    return { success: true, data: d.output };
  }

  const issues = flatten<typeof updateSchema>(d.issues);

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
