import { GenericError, ValidationError } from "$lib/error";
import { Err, Ok, Result } from "$lib/superposition";
import { title } from "$schemas";
import type { Prettify } from "$type";
import type { Problem } from "$type/problems";
import { exhaustiveMatchingGuard } from "$utils";
import { isEmptyString, uuidv4 } from "$utils/helpers";
import { array, boolean, flatten, type InferOutput, literal, nullish, object, safeParse, string, union } from "valibot";

const variableTypeSchema = union(
  [literal("image"), literal("equation"), literal("concept"), literal("problem"), literal("text")],
  "image type must be image, equation, concept, problem or string",
);

export const schema = object(
  {
    name: title,
    typ: variableTypeSchema,
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

export function validateVariableType(data: unknown) {
  const d = safeParse(variableTypeSchema, data);

  if (d.success) {
    return Ok(d.output);
  }

  return Err(new ValidationError({}, [`Invalid variable type: ${data}`]));
}

export type Variable = InferOutput<typeof schema>;
export type VariableValue = InferOutput<typeof variableValueSchema>;
export type InternalVariableValue = Prettify<VariableValue & { label: string }>;
export type VariableType = InferOutput<typeof schema>["typ"];
export type VariableTypeLoose = VariableType | ({} & string);
export const VARIABLE_TYPES: VariableType[] = ["text", "equation", "concept", "problem", "image"] as const;
export type VariableArray = InferOutput<typeof schemaArray>;

export type VariableIssues = ReturnType<typeof flatten<typeof schema>>["nested"];
export type VariableArrayIssues = ReturnType<typeof flatten<typeof schemaArray>>["nested"];

export class InternalVariable {
  readonly _tag = "InternalVariable" as const;
  // name: string = $state("");
  // typ?: VariableTypeLoose = $state();
  // nullable?: boolean = $state();
  // value?: string | null = $state();
  // label?: string | null;
  // required: boolean = $derived(
  //   this?.nullable === false
  //     && (this?.value === undefined || this?.value === null),
  // );
  #psudoId: string;
  #name: string = $state("");
  #typ: VariableType = $state("text");
  #nullable: boolean = $state(false);
  #value: string = $state("");
  #label: string = $state("");
  #required: boolean = $state(false);

  constructor(values: {
    name: string;
    typ: VariableType;
    nullable?: boolean;
    value?: string | null;
    label?: string | null;
  }) {
    this.#psudoId = uuidv4();
    this.#name = values.name;
    this.#typ = values.typ;
    this.#nullable = values.nullable ?? false;
    this.#value = values.value ?? "";
    this.#label = values.label ?? "";
  }

  get psudoId() {
    return this.#psudoId;
  }
  get name() {
    return this.#name;
  }
  get typ() {
    return this.#typ;
  }
  get nullable() {
    return this.#nullable;
  }
  get value() {
    if (isEmptyString(this.#value)) return null;
    return this.#value;
  }
  get label() {
    if (isEmptyString(this.#label)) return null;
    return this.#label;
  }
  get required() {
    return this.#required;
  }

  set name(value: string) {
    this.#name = value;
  }
  set typ(value: VariableType) {
    this.#typ = value;
  }
  set nullable(value: boolean | undefined) {
    if (value === true || !isEmptyString(this.#value)) {
      this.#required = false;
    } else {
      this.#required = true;
    }

    this.#nullable = value ?? false;
  }
  set value(value: string | null | undefined) {
    if (this.#nullable === true || !isEmptyString(value)) {
      this.#required = false;
    } else {
      this.#required = true;
    }

    this.#value = value ?? "";
  }
  set label(value: string | null | undefined) {
    this.#label = value ?? "";
  }

  public clone() {
    return new InternalVariable({
      name: this.#name,
      typ: this.#typ,
      nullable: this.#nullable,
      value: this.#value,
      label: this.#label,
    });
  }

  public log() {
    console.log({
      psudoId: this.#psudoId,
      name: this.#name,
      typ: this.#typ,
      nullable: this.#nullable,
      value: this.#value,
      label: this.#label,
      required: this.#required,
    });
  }

  public static default() {
    return new InternalVariable({
      name: "",
      typ: "text",
      nullable: false,
      value: null,
      label: null,
    });
  }
  public static fromProblem(problem: Problem, variableName: string): Result<InternalVariable, GenericError> {
    const variable = problem.variables.find(v => v.name === variableName);
    if (!variable) {
      return Err(new GenericError({}, [`variable with variable name: ${variableName} does not exist in Problem`]));
    }

    return Ok(
      new InternalVariable({
        name: variable.name,
        typ: variable.typ,
        nullable: variable.nullable,
        value: variable.defaultValue,
        label: InternalVariable.getDefaultLabel(problem, variable),
      }),
    );
  }

  public static fromProblemToArray(problem: Problem): InternalVariable[] {
    return problem.variables.map(variable => {
      return new InternalVariable({
        name: variable.name,
        typ: variable.typ,
        nullable: variable.nullable,
        value: variable.defaultValue,
        label: InternalVariable.getDefaultLabel(problem, variable),
      });
    });
  }

  static fromProblemVariantToArray(
    problem: Problem,
    id: string | null | undefined,
  ): InternalVariable[] {
    const variant = problem.variants.find(v => v.id === id);
    if (!variant) {
      console.error("Not a variant");
      return [];
    }
    const ret = variant.variableValues.map(v => {
      const variable = problem.variables.find(p => p.name === v.name)!;
      return new InternalVariable({
        name: variable.name,
        typ: variable.typ,
        nullable: variable.nullable,
        value: v.value,
        label: InternalVariable.getLabelFromVariableNameValue(problem, variable, v.value),
      });
    });

    problem.variables.forEach(variable => {
      if (ret.findIndex(t => t.#name === variable.name) === -1) {
        ret.push(
          new InternalVariable({
            name: variable.name,
            typ: variable.typ,
            nullable: variable.nullable,
            value: undefined,
            label: undefined,
          }),
        );
      }
    });
    return ret;
  }

  public static fromVariable(variable: Variable) {
    return new InternalVariable({
      name: variable.name,
      typ: variable.typ,
      nullable: variable.nullable,
      value: variable.defaultValue,
      label: undefined,
    });
  }

  public static fromVariablesToArray(variables: Variable[]) {
    return variables.map(v => InternalVariable.fromVariable(v));
  }

  public toVariable(): Variable {
    return {
      name: this.#name,
      typ: this.#typ as VariableType,
      nullable: this.#nullable,
      defaultValue: this.#value,
    };
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

export class InternalVariables {
  readonly _tag = "InternalVariable" as const;
  #internalVariables = $state<InternalVariable[]>([]);

  constructor() {}
}
