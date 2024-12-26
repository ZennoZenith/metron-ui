import {
  array,
  boolean,
  type InferOutput,
  literal,
  maxLength,
  maxValue,
  minLength,
  minValue,
  nonEmpty,
  nullable,
  number,
  object,
  pipe,
  string,
  trim,
  union,
} from "valibot";

export const schema = object(
  {
    id: pipe(
      number("Should be number"),
      minValue(1, "Number should be greater than 0"),
      maxValue(9999, "Number should be less than 10000"),
    ),
    name: pipe(
      string("Should be string"),
      trim(),
      nonEmpty("Shoud not be empty"),
      minLength(3, "Number of characters should be more than 2"),
      maxLength(150, "Number of characters should be less than 151"),
    ),
    typ: union(
      [literal("image"), literal("equation"), literal("concept"), literal("problem"), literal("string")],
      "image type must be image, equation, concept, problem or string",
    ),
    nullable: boolean("Should be boolean"),
    default_value: nullable(string("Should be string or null")),
  },
  "Should be an object",
);

export const schemaArray = array(schema, "invalid 'Variable' array");

export type Variable = InferOutput<typeof schema>;
export type VariableArray = InferOutput<typeof schemaArray>;
