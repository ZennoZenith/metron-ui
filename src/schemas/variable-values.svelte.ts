import type { VariableType } from "$schemas/variable";
import { uuidv4 } from "$utils/helpers";
import type { InternalVariable } from "./internal-variable.svelte";

export class InternalVariableValue {
  readonly _tag = "InternalVariableValue" as const;
  readonly #internalVariablePsudoId: string;
  #name: string = $state("");
  #typ: VariableType = $state("text");
  #value: string = $state("");
  #label: string = $state("");
  #required: boolean = $state(false);

  constructor(value?: {
    internalVariablePsudoId: string;
    name: string;
    typ: VariableType;
    value: string | null | undefined;
    label: string | null | undefined;
  }) {
    if (!value) {
      this.#internalVariablePsudoId = uuidv4();
      return;
    }

    this.#internalVariablePsudoId = value.internalVariablePsudoId;
    this.#name = value.name;
    this.#typ = value.typ;
    this.#value = value.value ?? "";
    this.#label = value.label ?? "";
  }

  get internalVariablePsudoId() {
    return this.#internalVariablePsudoId;
  }
  get name() {
    return this.#name;
  }
  get typ() {
    return this.#typ;
  }
  get value(): string {
    return this.#value;
  }
  get required() {
    return this.#required;
  }
  get label(): string {
    return this.#label;
  }

  set typ(value: VariableType) {
    this.#typ = value;
  }
  set required(value: boolean) {
    this.#required = value;
  }
  set value(value: string | null | undefined) {
    this.#value = value ?? "";
  }
  set label(value: string | null | undefined) {
    this.#label = value ?? "";
  }

  public log() {
    console.log(
      { name: this.#name, typ: this.#typ, value: this.#value, label: this.#label },
    );
  }

  static fromInternalVariable(internalVariable: InternalVariable) {
    return new InternalVariableValue({
      internalVariablePsudoId: internalVariable.psudoId,
      name: internalVariable.name,
      typ: internalVariable.typ,
      value: internalVariable.value,
      label: internalVariable.label,
    });
  }
}
