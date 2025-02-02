import { InternalVariableValue, InternalVariableValues } from "$features/variables/schemas/variable-values.svelte";
import type { InternalVariables } from "$schemas/variable.svelte";
import { uuidv4 } from "$utils/helpers";
import { untrack } from "svelte";
import type { VariantUpdate } from "./update";

export class InternalVariant {
  readonly _tag = "InternalVariant" as const;
  #psudoId: string;
  #id: string;
  readonly #internalVariables: InternalVariables;
  #correctAnswers: VariantUpdate["correctAnswers"];
  #incorrectAnswers: VariantUpdate["incorrectAnswers"];
  #requiredInternalVariableValues: InternalVariableValues = new InternalVariableValues();
  #optionalInternalVariableValues: InternalVariableValues = new InternalVariableValues();

  constructor(internalVariables: InternalVariables, values: VariantUpdate) {
    this.#internalVariables = internalVariables;
    this.#psudoId = uuidv4();
    this.#id = values.id ?? "";
    this.#correctAnswers = values.correctAnswers;
    this.#incorrectAnswers = values.incorrectAnswers;
    // this.#variableValues = values.variableValues;
    // this.#requiredInternalVariableValues = $derived(
    //   new InternalVariableValues(
    //     this.#internalVariables.internalVariables.filter(v => v.required === true).map(v =>
    //       InternalVariableValue.fromInternalVariable(v)
    //     ),
    //   ),
    // );
    // this.#optionalInternalVariableValues = $derived(
    //   new InternalVariableValues(
    //     this.#internalVariables.internalVariables.filter(v => v.required === false).map(v =>
    //       InternalVariableValue.fromInternalVariable(v)
    //     ),
    //   ),
    // );
    //

    $effect(() => {
      // this.#internalVariables.internalVariables;
      this.#requiredInternalVariableValues = new InternalVariableValues(
        this.#internalVariables.internalVariables.filter(v => v.required === true).map(v =>
          InternalVariableValue.fromInternalVariable(v)
        ),
      );

      this.#optionalInternalVariableValues = new InternalVariableValues(
        this.#internalVariables.internalVariables.filter(v => v.required === false).map(v =>
          InternalVariableValue.fromInternalVariable(v)
        ),
      );
      console.log("hello");
      console.log(this.#optionalInternalVariableValues.internalVariableValues);
      this.#optionalInternalVariableValues.log();
      // untrack(() => {
      // });
    });
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
  get requiredInternalVariableValues() {
    return this.#requiredInternalVariableValues;
  }
  get optionalInternalVariableValues() {
    return this.#optionalInternalVariableValues;
  }

  set id(value: string) {
    this.#id = value;
  }
  set correctAnswers(value: VariantUpdate["correctAnswers"]) {
    this.#correctAnswers = value;
  }
  set incorrectAnswers(value: VariantUpdate["incorrectAnswers"]) {
    this.#incorrectAnswers = value;
  }
  // set variableValues(value: VariantUpdate["variableValues"]) {
  //   this.#variableValues = value;
  // }

  public log() {
    console.log({
      psudoId: this.#psudoId,
      id: this.#id,
      correctAnswers: this.#correctAnswers,
      incorrectAnswers: this.#incorrectAnswers,
      requiredVariableValues: this.#requiredInternalVariableValues.internalVariableValues,
      optionalVariableValues: this.#optionalInternalVariableValues.internalVariableValues,
    });
  }

  public static default(internalVariables: InternalVariables) {
    return new InternalVariant(
      internalVariables,
      {
        id: "",
        correctAnswers: [{ id: undefined, answer: "", explanation: "" }],
        incorrectAnswers: [],
        variableValues: [],
      },
    );
  }
}

export class InternalVariants {
  readonly _tag = "InternalVariants" as const;

  readonly #internalVariants: InternalVariant[] = $state<InternalVariant[]>([]);
  readonly #internalVariables: InternalVariables;

  constructor(internalVariables: InternalVariables) {
    this.#internalVariables = internalVariables;
    this.#internalVariants = [InternalVariant.default(internalVariables)];
  }

  public log() {
    $inspect(this.#internalVariants);
  }

  public addInternalVariant(internalVariant?: InternalVariant) {
    if (internalVariant) {
      this.#internalVariants.push(internalVariant);
      return;
    }
    this.#internalVariants.push(InternalVariant.default(this.#internalVariables));
  }

  public removeInternalVariant(psudoId: InternalVariant["psudoId"]) {
    if (this.#internalVariants.length <= 1) return;
    const indexToRemove = this.#internalVariants.findIndex(value => value.psudoId === psudoId);

    if (indexToRemove < 0) {
      return;
    }
    this.#internalVariants.splice(indexToRemove, 1);
  }

  get internalVariants() {
    return this.#internalVariants as readonly InternalVariant[];
  }
}
