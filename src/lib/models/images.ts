import { UuidSchema } from "$types";
import type { FormDataValidationError, Superposition } from "$utils";
import {
  array,
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
  uuid,
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
export type ParsedImageCreate = InferOutput<typeof createSchema>;
export interface ValidationError extends FormDataValidationError {
  imageType?: [string, ...string[]];
  title?: [string, ...string[]];
  description?: [string, ...string[]];
  image?: [string, ...string[]];
  tags?: [string, ...string[]];
}
export function validateCreateSchema(data: unknown): Superposition<ValidationError, ParsedImageCreate> {
  const d = safeParse(createSchema, data);
  if (d.success) {
    return { success: true, data: d.output as ParsedImageCreate };
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
export interface ValidationSearchError extends FormDataValidationError {
  search?: [string, ...string[]];
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

const updateSchema = pipe(
  object(
    {
      id: pipe(string(), uuid("The UUID is badly formatted.")),
      ...createSchema.entries,
    },
  ),
);

export type ParsedTagUpdate = InferOutput<typeof updateSchema>;
export interface ValidationUpdateError extends FormDataValidationError {
  id?: [string, ...string[]];
  title?: [string, ...string[]];
}
export function validateUpdateSchema(data: unknown): Superposition<ValidationUpdateError, ParsedTagUpdate> {
  const d = safeParse(updateSchema, data);
  if (d.success) {
    return { success: true, data: d.output as ParsedTagUpdate };
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
