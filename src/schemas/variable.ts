import { GenericError, ValidationError } from "$lib/error";
import { Err, Ok, Result } from "$lib/superposition";
import { title } from "$schemas";
import type { Problem } from "$type/problems";
import { exhaustiveMatchingGuard } from "$utils";
import { array, boolean, flatten, type InferOutput, literal, nullish, object, safeParse, string, union } from "valibot";

export const schema = object(
  {
    name: title,
    typ: union(
      [literal("image"), literal("equation"), literal("concept"), literal("problem"), literal("text")],
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
    value: string("Should be string"),
  },
  "Should be an object",
);
export const variableValueSchemaArray = array(variableValueSchema, "invalid 'VariableValue' array");

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
export type VariableValue = InferOutput<typeof variableValueSchema>;
export type VariableType = InferOutput<typeof schema>["typ"];
export type VariableTypeLoose = VariableType | ({} & string);
export const VARIABLE_TYPES: VariableType[] = ["text", "equation", "concept", "problem", "image"] as const;
export type VariableArray = InferOutput<typeof schemaArray>;
export class VariableLoose {
  name: string;
  typ?: VariableTypeLoose;
  nullable?: boolean;
  value?: string | null;
  label?: string | null;
  required: boolean;
  constructor(values: {
    name: string;
    typ?: VariableTypeLoose;
    nullable?: boolean;
    value?: string | null;
    label?: string | null;
    required: boolean;
  }) {
    this.name = values.name;
    this.typ = values.typ;
    this.nullable = values.nullable;
    this.value = values.value;
    this.label = values.label;
    this.required = values.required;
  }

  public static fromProblem(problem: Problem, variableName: string): Result<VariableLoose, GenericError> {
    const variable = problem.variables.find(v => v.name === variableName);
    if (!variable) {
      return Err(new GenericError({}, [`variable with variable name: ${variableName} does not exist in Problem`]));
    }

    return Ok(
      new VariableLoose({
        name: variable.name,
        typ: variable.typ,
        nullable: variable.nullable,
        value: variable.defaultValue,
        label: VariableLoose.getDefaultLabel(problem, variable),
        required: variable.nullable === false
          && (variable.defaultValue === undefined || variable.defaultValue === null),
      }),
    );
  }

  public static fromProblemToArray(problem: Problem): VariableLoose[] {
    return problem.variables.map(variable => {
      return new VariableLoose({
        name: variable.name,
        typ: variable.typ,
        nullable: variable.nullable,
        value: variable.defaultValue,
        label: VariableLoose.getDefaultLabel(problem, variable),
        required: variable.nullable === false
          && (variable.defaultValue === undefined || variable.defaultValue === null),
      });
    });
  }

  static fromProblemVariantToArray(
    problem: Problem,
    id: string | null | undefined,
  ): VariableLoose[] {
    const variant = problem.variants.find(v => v.id === id);
    if (!variant) {
      console.error("Not a variant");
      return [];
    }
    const ret = variant.variableValues.map(v => {
      const variable = problem.variables.find(p => p.name === v.name)!;
      return new VariableLoose({
        name: variable.name,
        typ: variable.typ,
        nullable: variable.nullable,
        value: v.value,
        label: VariableLoose.getLabelFromVariableNameValue(problem, variable, v.value),
        required: variable.nullable === false
          && (variable.defaultValue === undefined || variable.defaultValue === null),
      });
    });

    problem.variables.forEach(variable => {
      if (ret.findIndex(t => t.name === variable.name) === -1) {
        ret.push(
          new VariableLoose({
            name: variable.name,
            typ: variable.typ,
            nullable: variable.nullable,
            value: undefined,
            label: undefined,
            required: variable.nullable === false
              && (variable.defaultValue === undefined || variable.defaultValue === null),
          }),
        );
      }
    });
    return ret;
  }

  public static fromVariable(variable: Variable) {
    return new VariableLoose({
      name: variable.name,
      typ: variable.typ,
      nullable: variable.nullable,
      value: variable.defaultValue,
      label: undefined,
      required: variable.nullable === false
        && (variable.defaultValue === undefined || variable.defaultValue === null),
    });
  }

  public static fromVariablesToArray(variables: Variable[]) {
    return variables.map(v => VariableLoose.fromVariable(v));
  }

  private static getDefaultLabel(
    problem: Problem,
    variable: Variable,
  ) {
    switch (variable.typ) {
      case "text":
        return variable.defaultValue;
      case "image":
        return problem.images.find(v => v.id === variable.defaultValue)?.title;
      case "equation":
        return problem.equations.find(v => v.id === variable.defaultValue)?.title;
      case "problem":
        return problem.problems.find(v => v.id === variable.defaultValue)?.problemStatement;
      case "concept":
        return problem.concepts.find(v => v.id === variable.defaultValue)?.title;
      default:
        return exhaustiveMatchingGuard(variable.typ);
    }
  }

  private static getLabelFromVariableNameValue(
    problem: Problem,
    variable: Variable,
    variableValue: string,
  ) {
    switch (variable.typ) {
      case "text":
        return variableValue;
      case "image":
        return problem.images.find(v => v.id === variableValue)?.title;
      case "equation":
        return problem.equations.find(v => v.id === variableValue)?.title;
      case "problem":
        return problem.problems.find(v => v.id === variableValue)?.problemStatement;
      case "concept":
        return problem.concepts.find(v => v.id === variableValue)?.title;
      default:
        return exhaustiveMatchingGuard(variable.typ);
    }
  }
}

export type VariableIssues = ReturnType<typeof flatten<typeof schema>>["nested"];
export type VariableArrayIssues = ReturnType<typeof flatten<typeof schemaArray>>["nested"];
