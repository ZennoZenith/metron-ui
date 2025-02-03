import { InternalVariableValue } from "$schemas/variable-values.svelte";
import type { SubscribeAction } from "$type";
import { exhaustiveMatchingGuard } from "$utils";
import { uuidv4 } from "$utils/helpers";
import { getContext, setContext } from "svelte";
import type { AnswerUpdate } from "./answer";
import type { InternalVariable } from "./internal-variable.svelte";

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
    this.#correctAnswers = value?.correctAnswers ?? [{ id: undefined, answer: "", explanation: "" }];
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

  private createInternalVariableValue(internalVariable: InternalVariable) {
    if (this.#internalVariableValues.findIndex(v => v.internalVariablePsudoId === internalVariable.psudoId) !== -1) {
      console.error(`Internal VariableValue already exist with id: ${internalVariable.psudoId}`);
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
      console.error(`Internal VariableValue not found with id: ${internalVariable.psudoId}`);
      return;
    }
    this.#internalVariableValues.splice(indexToRemove, 1);
  }

  private updateInternalVariableValue(internalVariable: InternalVariable) {
    const indexToUpdate = this.#internalVariableValues.findIndex(v =>
      v.internalVariablePsudoId === internalVariable.psudoId
    );

    if (indexToUpdate === -1) {
      console.error(`Internal VariableValue not found with id: ${internalVariable.psudoId}`);
      return;
    }

    this.#internalVariableValues[indexToUpdate] = InternalVariableValue.fromInternalVariable(internalVariable);
  }

  public static default(internalVaribles?: InternalVariable[]) {
    return new InternalVariant(
      {
        id: "",
        correctAnswers: [{ id: undefined, answer: "", explanation: "" }],
        incorrectAnswers: [],
        internalVariables: internalVaribles ?? [],
      },
    );
  }
}

export class InternalVariants {
  readonly _tag = "InternalVariants" as const;

  readonly #internalVariants: InternalVariant[] = $state<InternalVariant[]>([]);
  readonly #internalVariables: InternalVariable[];

  constructor() {
    this.#internalVariables = [];
    this.#internalVariants = [InternalVariant.default()];
  }

  public log() {
    $inspect(this.#internalVariants);
  }

  public addInternalVariant(internalVariant?: InternalVariant) {
    this.#internalVariants.push(internalVariant ?? InternalVariant.default(this.#internalVariables));
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
    switch (action) {
      case "CREATE":
        this.createInternalVariable(internalVariable);
        break;
      case "UPDATE":
        this.updateInternalVariable(internalVariable);
        break;
      case "DELETE":
        this.deleteInternalVariable(internalVariable);
        break;
      default:
        return exhaustiveMatchingGuard(action);
    }
  }

  private createInternalVariable(internalVariable: InternalVariable) {
    if (this.#internalVariables.findIndex(v => v.psudoId === internalVariable.psudoId) !== -1) {
      console.error(`Internal Variable already exist with id: ${internalVariable.psudoId}`);
      return;
    }
    this.#internalVariables.push(internalVariable);
  }

  private deleteInternalVariable(internalVariable: InternalVariable) {
    const indexToRemove = this.#internalVariables.findIndex(v => v.psudoId === internalVariable.psudoId);

    if (indexToRemove === -1) {
      console.error(`Internal Variable not found with id: ${internalVariable.psudoId}`);
      return;
    }
    this.#internalVariables.splice(indexToRemove, 1);
  }

  private updateInternalVariable(internalVariable: InternalVariable) {
    const indexToUpdate = this.#internalVariables.findIndex(v => v.psudoId === internalVariable.psudoId);

    if (indexToUpdate === -1) {
      console.error(`Internal Variable not found with id: ${internalVariable.psudoId}`);
      return;
    }

    this.#internalVariables[indexToUpdate] = internalVariable;
  }

  get internalVariants() {
    return this.#internalVariants as readonly InternalVariant[];
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
