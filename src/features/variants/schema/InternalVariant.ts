import { uuidv4 } from "$utils/helpers";
import type { VariantUpdate } from "./update";

export class InternalVariant {
  readonly _tag = "InternalVariant" as const;
  #psudoId: string;
  #id: string;
  #correctAnswers: VariantUpdate["correctAnswers"];
  #incorrectAnswers: VariantUpdate["incorrectAnswers"];
  #variableValues: VariantUpdate["variableValues"];

  constructor(values: VariantUpdate) {
    this.#psudoId = uuidv4();
    this.#id = values.id ?? "";
    this.#correctAnswers = values.correctAnswers;
    this.#incorrectAnswers = values.incorrectAnswers;
    this.#variableValues = values.variableValues;
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
  get variableValues() {
    return this.#variableValues;
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
  set variableValues(value: VariantUpdate["variableValues"]) {
    this.#variableValues = value;
  }

  public log() {
    console.log({
      psudoId: this.#psudoId,
      id: this.#id,
      correctAnswers: this.#correctAnswers,
      incorrectAnswers: this.#incorrectAnswers,
      variableValues: this.#variableValues,
    });
  }

  public static default() {
    return new InternalVariant({
      id: "",
      correctAnswers: [{ id: undefined, answer: "", explanation: "" }],
      incorrectAnswers: [],
      variableValues: [],
    });
  }
}
