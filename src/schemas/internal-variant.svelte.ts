import type { VariantUpdate } from "$features/variants/schemas/update";
import { InternalVariableValue } from "$schemas/internal-variable-values.svelte";
import type { SubscribeAction } from "$type";
import { exhaustiveMatchingGuard } from "$utils";
import { isEmptyString, setEmptyStringAsNullish, uuidv4 } from "$utils/helpers";
import { getContext, setContext } from "svelte";
import type { AnswerUpdate } from "./answer";
import type { InternalVariable, InternalVariables } from "./internal-variable.svelte";

export class InternalVariant {
  readonly _tag = "InternalVariant" as const;
  #psudoId: string;
  #id: string;
  #correctAnswers: AnswerUpdate[];
  #incorrectAnswers: AnswerUpdate[];
  #internalVariableValues: InternalVariableValue[] = $state([]);

  constructor(value: {
    id?: string;
    correctAnswers?: AnswerUpdate[];
    incorrectAnswers?: AnswerUpdate[];
    internalVariables?: InternalVariable[];
  }) {
    this.#psudoId = uuidv4();
    this.#id = value?.id ?? "";
    this.#correctAnswers = value?.correctAnswers ?? [{ id: uuidv4(), answer: "", explanation: "" }];
    this.#incorrectAnswers = value?.incorrectAnswers ?? [];
    this.#internalVariableValues = value?.internalVariables?.map(v => InternalVariableValue.fromInternalVariable(v))
      ?? [];
  }

  get psudoId() {
    return this.#psudoId;
  }
  get id() {
    return this.#id;
  }
  get correctAnswers() {
    return this.#correctAnswers;
  }
  get incorrectAnswers() {
    return this.#incorrectAnswers;
  }
  get internalVariableValues() {
    return this.#internalVariableValues;
  }

  set id(value: string) {
    this.#id = value;
  }
  set correctAnswers(value: AnswerUpdate[]) {
    this.#correctAnswers = value;
  }
  set incorrectAnswers(value: AnswerUpdate[]) {
    this.#incorrectAnswers = value;
  }

  private createInternalVariableValue(internalVariable: InternalVariable) {
    if (this.#internalVariableValues.findIndex(v => v.internalVariablePsudoId === internalVariable.psudoId) !== -1) {
      console.error(`CannotCreate: Internal VariableValue already exist with id: ${internalVariable.psudoId}`);
      return;
    }
    this.#internalVariableValues.push(
      InternalVariableValue.fromInternalVariable(internalVariable),
    );
  }

  private deleteInternalVariableValue(internalVariable: InternalVariable) {
    const indexToRemove = this.#internalVariableValues.findIndex(v =>
      v.internalVariablePsudoId === internalVariable.psudoId
    );

    if (indexToRemove === -1) {
      console.error(`CannotDelete: Internal VariableValue not found with id: ${internalVariable.psudoId}`);
      return;
    }
    this.#internalVariableValues.splice(indexToRemove, 1);
  }

  private updateInternalVariableValue(internalVariable: InternalVariable) {
    const indexToUpdate = this.#internalVariableValues.findIndex(v =>
      v.internalVariablePsudoId === internalVariable.psudoId
    );

    if (indexToUpdate === -1) {
      console.error(`CannotUpdate: Internal VariableValue not found with id: ${internalVariable.psudoId}`);
      return;
    }

    this.#internalVariableValues[indexToUpdate] = InternalVariableValue.fromInternalVariable(internalVariable);
    this.#internalVariableValues[indexToUpdate].value = "";
  }

  public log() {
    console.log({
      psudoId: this.#psudoId,
      id: this.#id,
      correctAnswers: this.#correctAnswers,
      incorrectAnswers: this.#incorrectAnswers,
      internalVariableValues: this.#internalVariableValues,
    });
  }

  public updateInternalVariableValues(internalVariable: InternalVariable, action: SubscribeAction) {
    switch (action) {
      case "CREATE":
        this.createInternalVariableValue(internalVariable);
        break;
      case "UPDATE":
        this.updateInternalVariableValue(internalVariable);
        break;
      case "DELETE":
        this.deleteInternalVariableValue(internalVariable);
        break;
      default:
        return exhaustiveMatchingGuard(action);
    }
  }

  public static default(internalVaribles?: InternalVariable[]) {
    return new InternalVariant(
      {
        id: "",
        correctAnswers: [{ id: uuidv4(), answer: "", explanation: "" }],
        incorrectAnswers: [],
        internalVariables: internalVaribles ?? [],
      },
    );
  }

  public toVariant(): VariantUpdate {
    return {
      id: this.#id,
      correctAnswers: this.#correctAnswers.map(v => {
        return {
          id: setEmptyStringAsNullish(v.id),
          answer: v.answer,
          explanation: setEmptyStringAsNullish(v.explanation),
        };
      }),
      incorrectAnswers: this.#incorrectAnswers.map(v => {
        return {
          id: setEmptyStringAsNullish(v.id),
          answer: v.answer,
          explanation: setEmptyStringAsNullish(v.explanation),
        };
      }),
      variableValues: this.#internalVariableValues
        .map(v => v.toVariableValue())
        .filter(v => {
          return !isEmptyString(v.name) && !isEmptyString(v.value);
        }),
    };
  }
}

export class InternalVariants {
  readonly _tag = "InternalVariants" as const;

  readonly #internalVariants: InternalVariant[] = $state<InternalVariant[]>([]);
  readonly #internalVariables: readonly InternalVariable[];

  constructor(internalVariables: InternalVariables) {
    this.#internalVariables = internalVariables.internalVariables;
    this.#internalVariants = [InternalVariant.default()];
  }

  get internalVariants() {
    return this.#internalVariants as readonly InternalVariant[];
  }

  public log() {
    $inspect(this.#internalVariants);
  }

  public addInternalVariant(internalVariant?: InternalVariant) {
    this.#internalVariants.push(internalVariant ?? InternalVariant.default([...this.#internalVariables]));
  }

  public removeInternalVariant(psudoId: InternalVariant["psudoId"]) {
    if (this.#internalVariants.length <= 1) return;
    const indexToRemove = this.#internalVariants.findIndex(value => value.psudoId === psudoId);

    if (indexToRemove < 0) {
      return;
    }
    this.#internalVariants.splice(indexToRemove, 1);
  }

  public internalVariableAction(internalVariable: InternalVariable, action: SubscribeAction) {
    this.#internalVariants.forEach(internalVariant =>
      internalVariant.updateInternalVariableValues(internalVariable, action)
    );
  }

  public toVariants(): VariantUpdate[] {
    return this.#internalVariants.map(v => v.toVariant());
  }
}

export function setInternalVariantsContext(
  VariantsContextKey: symbol,
  ...options: ConstructorParameters<typeof InternalVariants>
) {
  return setContext(VariantsContextKey, new InternalVariants(...options));
}

export function getInternalVariantsContext(VariantsContextKey: symbol) {
  const context = getContext<ReturnType<typeof setInternalVariantsContext> | undefined>(VariantsContextKey);

  if (!context) {
    throw new Error(
      `Could not get internal Variants context from key: ${VariantsContextKey.toString()}`,
    );
  }
  return context;
}
