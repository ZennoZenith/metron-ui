import { ValidationError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import { UuidSchema } from "$utils/uuid";
import {
  custom,
  flatten,
  type InferOutput,
  maxLength,
  minLength,
  nonEmpty,
  object,
  optional,
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
      description: optional(pipe(
        string("description should be string"),
        trim(),
        nonEmpty("description shoud not be empty string"),
        minLength(3, "description length should be between 3 and 2048"),
        maxLength(2048, "description length should be between 3 and 2048"),
      )),
      content: pipe(
        string("content should be string"),
        trim(),
        nonEmpty("content shoud not be empty string"),
        minLength(3, "content length should be between 3 and 2048"),
        maxLength(2048, "content length should be between 3 and 2048"),
      ),
      tags: optional(pipe(
        string(),
        custom<string>(input => {
          if (typeof input !== "string") return false;
          return input.split(",").every(v => safeParse(UuidSchema, v));
        }, "The UUID is badly formatted."),
      )),
    },
  ),
);
export type CreateSchema = InferOutput<typeof createSchema>;
export type CreateIssues = ReturnType<typeof flatten<typeof createSchema>>["nested"];

export function validateCreateSchema(data: unknown) {
  const d = safeParse(createSchema, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: CreateIssues = flatten<typeof createSchema>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}
