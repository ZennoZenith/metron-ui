import { ValidationError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import { title } from "$schemas";
import { array, boolean, flatten, type InferOutput, literal, nullish, object, safeParse, string, union } from "valibot";

export const schema = object(
  {
    name: title,
    typ: union(
      [literal("image"), literal("equation"), literal("concept"), literal("problem"), literal("string")],
      "image type must be image, equation, concept, problem or string",
    ),
    nullable: boolean("Should be boolean"),
    defaultValue: nullish(string("Should be string or null")),
  },
  "Should be an object",
);

export const schemaArray = array(schema, "invalid 'Variable' array");

export const variableValueSchema = object(
  {
    name: title,
    defaultValue: string("Should be string"),
  },
  "Should be an object",
);
export const variableValueSchemaArray = array(schema, "invalid 'VariableValue' array");

export function validateSchema(data: unknown) {
  const d = safeParse(schema, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: VariableIssues = flatten<typeof schema>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}

export function validateSchemaArray(data: unknown) {
  const d = safeParse(schemaArray, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: VariableArrayIssues = flatten<typeof schemaArray>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}

export type Variable = InferOutput<typeof schema>;
export type VariableType = InferOutput<typeof schema>["typ"];
export type VariableArray = InferOutput<typeof schemaArray>;

export type VariableIssues = ReturnType<typeof flatten<typeof schema>>["nested"];
export type VariableArrayIssues = ReturnType<typeof flatten<typeof schemaArray>>["nested"];
