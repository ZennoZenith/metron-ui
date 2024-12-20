import { IMAGE_BASE_ROUTE } from "$constants";
import { ValidationError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import {
  array,
  flatten,
  type InferOutput,
  literal,
  nullable,
  object,
  pipe,
  safeParse,
  string,
  transform,
  union,
  uuid,
} from "valibot";

const schema = pipe(
  object(
    {
      id: pipe(string("image id shoud be string"), uuid("The image id:Uuid is badly formatted.")),
      title: string("image title should be string"),
      description: nullable(string("description should be string")),
      imageHash: string("image hash should be string"),
      fileLocation: pipe(
        string("file location should be string"),
        transform(v => v.replace("file:///", `${IMAGE_BASE_ROUTE}/`)),
      ),
      imageType: union(
        [literal("Png"), literal("Jpeg"), literal("Svg")],
        "image type must be Png, Jpg or Svg",
      ),
      tags: array(
        object({
          id: pipe(string("tag id should be string"), uuid("The tag id:Uuid is badly formatted.")),
          title: string("tag title should be string"),
        }, "Tag must be of type object {id, title}"),
        "tags must be array of Tag",
      ),
      createdAt: string("created at should be string"),
      updatedAt: string("updated at should be string"),
    },
  ),
);

const schemaArray = array(schema, "invalid 'Image' array");

export type Image = InferOutput<typeof schema>;
export type ImageArray = InferOutput<typeof schemaArray>;
export type ImageIssues = ReturnType<typeof flatten<typeof schema>>["nested"];
export type ImageArrayIssues = ReturnType<typeof flatten<typeof schemaArray>>["nested"];

export function validateSchema(data: unknown) {
  const d = safeParse(schema, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: ImageIssues = flatten<typeof schema>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}

export function validateSchemaArray(data: unknown) {
  const d = safeParse(schemaArray, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: ImageArrayIssues = flatten<typeof schemaArray>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}
