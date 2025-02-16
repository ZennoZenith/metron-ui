import { ValidationError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import { content, title } from "$schemas";
import { uuidArrayString } from "$schemas/uuid";
import {
  file,
  flatten,
  type InferOutput,
  literal,
  maxSize,
  mimeType,
  object,
  optional,
  pipe,
  safeParse,
  union,
} from "valibot";

export class CreateSchemaError extends ValidationError {
  constructor(issues: CreateIssues = {}) {
    super(issues, "ImageCreateSchemaError", "Image create schema error");
  }
}

export const createSchema = object(
  {
    imageType: union(
      [literal("image/png"), literal("image/jpeg"), literal("image/svg+xml")],
      "image type must be image/png, image/jpeg or image/svg+xml",
    ),
    title,
    description: optional(content),
    image: pipe(
      file("Please select an image file."),
      mimeType(["image/jpeg", "image/png", "image/svg+xml"], "Please select a JPEG, PNG or SVG file."),
      maxSize(1024 * 1024 * 3, "Please select a file smaller than 3 MB."),
    ),
    tags: optional(uuidArrayString),
  },
  "Should be an object",
);

export function validateCreateSchema(data: unknown) {
  const d = safeParse(createSchema, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: CreateIssues = flatten<typeof createSchema>(d.issues).nested ?? {};

  return Err(new CreateSchemaError(issues));
}

export type CreateSchema = InferOutput<typeof createSchema>;
export type CreateIssues = ReturnType<typeof flatten<typeof createSchema>>["nested"];
