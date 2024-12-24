import { ValidationError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import {
  array,
  flatten,
  type InferOutput,
  nonEmpty,
  nullable,
  object,
  pipe,
  safeParse,
  string,
  trim,
  uuid,
} from "valibot";

const schema = pipe(
  object(
    {
      id: pipe(string("equation id shoud be string"), uuid("The equation id:Uuid is badly formatted.")),
      title: pipe(
        string("equation title should be string"),
        trim(),
        nonEmpty("equation title shoud not be empty"),
      ),
      description: nullable(string("description should be string")),
      content: pipe(
        string("equation content should be string"),
        trim(),
        nonEmpty("equation content shoud not be empty"),
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

const schemaArray = array(schema, "invalid 'Equation' array");

export type Equation = InferOutput<typeof schema>;
export type EquationArray = InferOutput<typeof schemaArray>;
export type EquationIssues = ReturnType<typeof flatten<typeof schema>>["nested"];
export type EquationArrayIssues = ReturnType<typeof flatten<typeof schemaArray>>["nested"];

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
