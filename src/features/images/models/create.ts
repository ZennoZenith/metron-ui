import type { FormDataValidationError, Superposition } from "$utils";
import { UuidSchema } from "$utils/uuid";
import {
  custom,
  file,
  flatten,
  type InferOutput,
  literal,
  maxLength,
  maxSize,
  mimeType,
  minLength,
  nonEmpty,
  object,
  optional,
  pipe,
  safeParse,
  string,
  trim,
  union,
} from "valibot";

export type Tag = {
  id: string;
  title: string;
};

const createSchema = pipe(
  object(
    {
      imageType: union(
        [literal("image/png"), literal("image/jpeg"), literal("image/svg+xml")],
        "image type must be image/png, image/jpeg or image/svg+xml",
      ),
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
      image: pipe(
        file("Please select an image file."),
        mimeType(["image/jpeg", "image/png", "image/svg+xml"], "Please select a JPEG, PNG or SVG file."),
        maxSize(1024 * 1024 * 3, "Please select a file smaller than 3 MB."),
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
export interface ValidationError extends FormDataValidationError {
  imageType?: [string, ...string[]];
  title?: [string, ...string[]];
  description?: [string, ...string[]];
  image?: [string, ...string[]];
  tags?: [string, ...string[]];
}
export function validateCreateSchema(data: unknown): Superposition<ValidationError, CreateSchema> {
  const d = safeParse(createSchema, data);
  if (d.success) {
    return { success: true, data: d.output as CreateSchema };
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