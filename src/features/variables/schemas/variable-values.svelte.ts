import type { InternalVariable, VariableType } from "$schemas/variable.svelte";

export class InternalVariableValue {
  readonly _tag = "InternalVariableValue" as const;
  #name: string = $state("");
  #typ: VariableType = $state("text");
  #value: string | null | undefined = $state();
  #label: string | null | undefined = $state();

  constructor(value?: {
    name: string;
    typ: VariableType;
    value: string | null | undefined;
    label: string | null | undefined;
  }) {
    if (!value) return;

    this.#name = value.name;
    this.#typ = value.typ;
    this.#value = value.value;
    this.#label = value.label;
  }

  get name() {
    return this.#name;
  }
  get typ() {
    return this.#typ;
  }
  get value() {
    return this.#value;
  }
  get label() {
    return this.#label;
  }

  // set typ(value: VariableType) {
  //   this.#typ = value;
  // }
  set value(value: string | null | undefined) {
    this.#value = value;
  }
  set label(value: string | null | undefined) {
    this.#label = value;
  }

  public log() {
    console.log(
      { name: this.#name, typ: this.#typ, value: this.#value, label: this.#label },
    );
  }

  static fromInternalVariable(internalVariable: InternalVariable) {
    return new InternalVariableValue({
      name: internalVariable.name,
      typ: internalVariable.typ,
      value: internalVariable.value,
      label: internalVariable.label,
    });
  }
}

export class InternalVariableValues {
  readonly _tag = "InternalVariableValues" as const;

  #internalVariableValues: InternalVariableValue[] = $state([]);

  constructor(internalVariableValues?: InternalVariableValue[]) {
    if (!internalVariableValues) return;
    this.#internalVariableValues = internalVariableValues;
  }

  get internalVariableValues() {
    return this.#internalVariableValues;
  }

  public log() {
    this.#internalVariableValues.forEach(v => v.log());
  }
}
