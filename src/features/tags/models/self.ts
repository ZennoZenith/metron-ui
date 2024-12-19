import { ValidationError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import { array, flatten, type InferOutput, nonEmpty, object, pipe, safeParse, string, trim, uuid } from "valibot";

const schema = pipe(
  object(
    {
      id: pipe(string(), uuid("The UUID is badly formatted.")),
      title: pipe(
        string("title should be string"),
        trim(),
        nonEmpty("title shoud not be empty"),
      ),
    },
  ),
);

const schemaArray = array(schema, "invalid 'Tag' array");

export type Tag = InferOutput<typeof schema>;
export type TagArray = InferOutput<typeof schemaArray>;

export function validateSchema(data: unknown) {
  const d = safeParse(schema, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues = flatten<typeof schema>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}

export function validateSchemaArray(data: unknown) {
  const d = safeParse(schemaArray, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues = flatten<typeof schemaArray>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}
