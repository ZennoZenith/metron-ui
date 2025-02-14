import { ApiModelError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import { uuidSchema } from "$schemas/uuid";
import { array, flatten, type InferOutput, object, safeParse, string } from "valibot";

export const schema = object(
  {
    id: uuidSchema,
    title: string("Should be string"),
  },
  "Should be an object",
);

export const schemaArray = array(schema, "invalid 'Tag' array");

export function validateSchema(data: unknown) {
  const d = safeParse(schema, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: TagIssues = flatten<typeof schema>(d.issues)["nested"] ?? {};

  return Err(new ApiModelError(issues, "Tag model out of sync"));
}

export function validateSchemaArray(data: unknown) {
  const d = safeParse(schemaArray, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: TagArrayIssues = flatten<typeof schemaArray>(d.issues)["nested"] ?? {};

  return Err(new ApiModelError(issues, "Tag array model out of sync"));
}

export type Tag = InferOutput<typeof schema>;
export type TagArray = InferOutput<typeof schemaArray>;
export type TagIssues = ReturnType<typeof flatten<typeof schema>>["nested"];
export type TagArrayIssues = ReturnType<typeof flatten<typeof schemaArray>>["nested"];
