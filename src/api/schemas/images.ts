import { schemaArray as tags } from "$api/schemas/tags";
import { ValidationError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import { uuidSchema } from "$schemas/uuid";
import { array, flatten, type InferOutput, literal, nullable, object, safeParse, string, union } from "valibot";

export const schema = object(
  {
    id: uuidSchema,
    title: string("Should be string"),
    description: nullable(string("Should be string")),
    imageHash: string("Should be string"),
    fileLocation: string("Should be string"),
    imageType: union(
      [literal("Png"), literal("Jpeg"), literal("Svg")],
      "image type must be Png, Jpg or Svg",
    ),
    tags,
    createdAt: string("Should be string"),
    updatedAt: string("Should be string"),
  },
  "Should be an object",
);

export const schemaArray = array(schema, "invalid 'Image' array");

export function validateSchema(data: unknown) {
  const d = safeParse(schema, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: ImageIssues = flatten<typeof schema>(d.issues).nested ?? {};

  return Err(new ValidationError(issues));
}

export function validateSchemaArray(data: unknown) {
  const d = safeParse(schemaArray, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: ImageArrayIssues = flatten<typeof schemaArray>(d.issues).nested ?? {};

  return Err(new ValidationError(issues));
}

export type Image = InferOutput<typeof schema>;
export type ImageArray = InferOutput<typeof schemaArray>;
export type ImageIssues = ReturnType<typeof flatten<typeof schema>>["nested"];
export type ImageArrayIssues = ReturnType<typeof flatten<typeof schemaArray>>["nested"];
