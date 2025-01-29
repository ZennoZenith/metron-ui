import { ValidationError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import { schemaShortArray as conceptsShortSchemaArary } from "$schemas/concepts/self";
import { schemaArray as equationSchemaArray } from "$schemas/equations/self";
import { schemaArray as imagesSchemaArary } from "$schemas/images/self";
import { schemaArray as tagSchemaArray } from "$schemas/tags/self";
import { uuidSchema } from "$schemas/uuid";
import { schemaArray as variableSchemaArray } from "$schemas/variable";
import { schemaArray as varientSchemaArray } from "$schemas/variant";
import { array, flatten, type InferOutput, literal, nullish, object, safeParse, string, union } from "valibot";

export const questionTypeSchema = union(
  [literal("MCQ"), literal("MCA"), literal("Binary"), literal("FillBlank"), literal("Matching")],
  "problem type must be MCQ, MCA, Binary, FillBlank or Matching",
);

export const schemaShort = object(
  {
    id: uuidSchema,
    problemStatement: string("Should be string"),
    questionType: string("Should be string"),
    tags: tagSchemaArray,
    createdAt: string("created at should be string"),
    updatedAt: string("updated at should be string"),
  },
  "Should be an object",
);

export const schemaShortArray = array(schemaShort, "invalid 'problemShort' array");

export const schema = object(
  {
    id: uuidSchema,
    problemStatement: string("Should be string"),
    hint: nullish(string("Should be string")),
    questionType: string("Should be string"),
    tags: tagSchemaArray,
    equations: equationSchemaArray,
    images: imagesSchemaArary,
    concepts: conceptsShortSchemaArary,
    problems: schemaShortArray,
    variables: variableSchemaArray,
    variants: varientSchemaArray,
    explanation: nullish(string("Should be string")),
    createdAt: string("created at should be string"),
    updatedAt: string("updated at should be string"),
  },
  "Should be an object",
);
export const schemaArray = array(schema, "invalid 'Problem' array");

export function validateSchema(data: unknown) {
  const d = safeParse(schema, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: ProblemIssues = flatten<typeof schema>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}

export function validateSchemaArray(data: unknown) {
  const d = safeParse(schemaArray, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: ProblemArrayIssues = flatten<typeof schemaArray>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}

export function validateShortSchema(data: unknown) {
  const d = safeParse(schemaShort, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: ProblemShortArrayIssues = flatten<typeof schemaShort>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}

export function validateShortSchemaArray(data: unknown) {
  const d = safeParse(schemaShortArray, data);

  if (d.success) {
    return Ok(d.output);
  }

  const issues: ProblemArrayIssues = flatten<typeof schemaShortArray>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}

export type Problem = InferOutput<typeof schema>;
export type ProblemArray = InferOutput<typeof schemaArray>;
export type ProblemShort = InferOutput<typeof schemaShort>;
export type ProblemShortArray = InferOutput<typeof schemaShortArray>;

export type ProblemIssues = ReturnType<typeof flatten<typeof schema>>["nested"];
export type ProblemArrayIssues = ReturnType<typeof flatten<typeof schemaArray>>["nested"];
export type ProblemShortIssues = ReturnType<typeof flatten<typeof schemaShort>>["nested"];
export type ProblemShortArrayIssues = ReturnType<typeof flatten<typeof schemaShortArray>>["nested"];

export type QuestionType = InferOutput<typeof questionTypeSchema>;
