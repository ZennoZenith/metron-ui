import { ValidationError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import { schemaArray as equationSchemaArray } from "$schemas/equations/self";
import { schemaArray as imagesSchemaArary } from "$schemas/images/self";
import { schemaArray as tagSchemaArray } from "$schemas/tags/self";
import { uuidSchema } from "$schemas/uuid";
import { schemaArray as variableSchemaArray } from "$schemas/variable.svelte";
import { array, flatten, type InferOutput, nullable, object, safeParse, string } from "valibot";

export const schemaShort = object(
  {
    id: uuidSchema,
    title: string("Should be string"),
    description: nullable(string("Should be string")),
    tags: tagSchemaArray,
    createdAt: string("created at should be string"),
    updatedAt: string("updated at should be string"),
  },
  "Should be an object",
);

export const schemaShortArray = array(schemaShort, "invalid 'conceptShort' array");

export const schema = object(
  {
    id: uuidSchema,
    title: string("Should be string"),
    description: nullable(string("Should be string")),
    content: string("Should be string"),
    equations: equationSchemaArray,
    tags: tagSchemaArray,
    images: imagesSchemaArary,
    concepts: schemaShortArray,
    variables: variableSchemaArray,
    createdAt: string("created at should be string"),
    updatedAt: string("updated at should be string"),
  },
  "Should be an object",
);

export const schemaArray = array(schema, "invalid 'concept' array");

export function validateSchema(data: unknown) {
  const d = safeParse(schema, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: ConceptIssues = flatten<typeof schema>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}

export function validateSchemaArray(data: unknown) {
  const d = safeParse(schemaArray, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: ConceptArrayIssues = flatten<typeof schemaArray>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}

export function validateShortSchema(data: unknown) {
  const d = safeParse(schemaShort, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: ConceptShortArrayIssues = flatten<typeof schemaShort>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}

export function validateShortSchemaArray(data: unknown) {
  const d = safeParse(schemaShortArray, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: ConceptArrayIssues = flatten<typeof schemaShortArray>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}

export type Concept = InferOutput<typeof schema>;
export type ConceptArray = InferOutput<typeof schemaArray>;
export type ConceptShort = InferOutput<typeof schemaShort>;
export type ConceptShortArray = InferOutput<typeof schemaShortArray>;

export type ConceptIssues = ReturnType<typeof flatten<typeof schema>>["nested"];
export type ConceptArrayIssues = ReturnType<typeof flatten<typeof schemaArray>>["nested"];
export type ConceptShortIssues = ReturnType<typeof flatten<typeof schemaShort>>["nested"];
export type ConceptShortArrayIssues = ReturnType<typeof flatten<typeof schemaShortArray>>["nested"];
