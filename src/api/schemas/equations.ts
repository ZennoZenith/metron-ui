import { schemaArray as tags } from "$api/schemas/tags";
import { ValidationError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import { uuidSchema } from "$schemas/uuid";
import { array, flatten, type InferOutput, nullish, object, safeParse, string } from "valibot";

export const schema = object(
  {
    id: uuidSchema,
    title: string("Should be string"),
    description: nullish(string("Should be string")),
    content: string("Should be string"),
    tags,
    createdAt: string("created at should be string"),
    updatedAt: string("updated at should be string"),
  },
  "Should be an object",
);

export const schemaArray = array(schema, "invalid 'Equation' array");

export function validateSchema(data: unknown) {
  const d = safeParse(schema, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: EquationIssues = flatten<typeof schema>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}

export function validateSchemaArray(data: unknown) {
  const d = safeParse(schemaArray, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: EquationArrayIssues = flatten<typeof schemaArray>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}

export type Equation = InferOutput<typeof schema>;
export type EquationArray = InferOutput<typeof schemaArray>;
export type EquationIssues = ReturnType<typeof flatten<typeof schema>>["nested"];
export type EquationArrayIssues = ReturnType<typeof flatten<typeof schemaArray>>["nested"];
