import { Log } from "$lib/logger";
import type { SubscribeAction } from "$type";
import type { Variable, VariableType, VariableValue } from "$type/variables";
import { isEmptyString, setEmptyStringAsNullish, uuidv4 } from "$utils/helpers";
import { getContext, setContext } from "svelte";

type SubscribeFn = (value: InternalVariable, action: SubscribeAction) => void;

export class InternalVariable {
  readonly _tag = "InternalVariable" as const;
  #psudoId: string;
  #name: string = $state("");
  #typ: VariableType = $state("text");
  #nullable: boolean = $state(false);
  #value: string = $state("");
  #label: string = $state("");
  #required: boolean = $state(true);
  #subscribers: (SubscribeFn | undefined)[] = [];

  constructor(value: {
    name: string;
    typ: VariableType;
    nullable?: boolean;
    value?: string | null;
    label?: string | null;
  }) {
    this.#psudoId = uuidv4();
    this.#name = value.name;
    this.#typ = value.typ;
    this.#nullable = value.nullable ?? false;
    this.#value = value.value ?? "";
    this.#label = value.label ?? "";

    if (this.#nullable === true || !isEmptyString(this.#value)) {
      this.#required = false;
    } else {
      this.#required = true;
    }
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
  get value(): string {
    // if (isEmptyString(this.#value)) return null;
    return this.#value;
  }
  get label(): string {
    // if (isEmptyString(this.#label)) return null;
    return this.#label;
  }
  get required() {
    return this.#required;
  }

  set name(value: string) {
    this.#name = value;
    this.notify();
  }

  set typ(value: VariableType) {
    this.#typ = value;
    this.notify();
  }
  set nullable(value: boolean | undefined) {
    if (value === true || !isEmptyString(this.#value)) {
      this.#required = false;
    } else {
      this.#required = true;
    }

    this.#nullable = value ?? false;
    this.notify();
  }
  set value(value: string | null | undefined) {
    if (this.#nullable === true || !isEmptyString(value)) {
      this.#required = false;
    } else {
      this.#required = true;
    }

    this.#value = value ?? "";
    this.notify();
  }
  set label(value: string | null | undefined) {
    this.#label = value ?? "";
  }

  /**
   * HACK: this function clears Label and value without effecting require state
   */
  public clearLabelAndValue() {
    this.#value = "";
    this.#label = "";
    return this;
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

  public cloneWithSamePsudoId() {
    const cloned = this.clone();
    cloned.#psudoId = this.#psudoId;
    return cloned;
  }

  public cloneFromVariableValue(variableValue?: VariableValue) {
    const cloned = this.clone();

    if (variableValue && variableValue.name === this.#name) {
      cloned.#psudoId = this.#psudoId;
      cloned.#value = variableValue.value;
    } else {
      cloned.#value = "";
    }
    return cloned;
  }

  public log() {
    Log.info({
      psudoId: this.#psudoId,
      name: this.#name,
      typ: this.#typ,
      nullable: this.#nullable,
      value: this.#value,
      label: this.#label,
      required: this.#required,
    });
  }

  public toVariable(): Variable {
    return {
      name: $state.snapshot(this.#name),
      nullable: $state.snapshot(this.#nullable),
      typ: $state.snapshot(this.#typ),
      defaultValue: setEmptyStringAsNullish($state.snapshot(this.#value)),
    };
  }

  public subscribe(fn?: SubscribeFn) {
    if (!fn) return;
    this.#subscribers.push(fn);
  }

  private notify(action: SubscribeAction = "UPDATE", internalVariable?: InternalVariable) {
    const temp = internalVariable ?? this;
    for (const subscriber of this.#subscribers) {
      subscriber?.(temp, action);
    }
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
}

export class InternalVariables {
  readonly _tag = "InternalVariables" as const;
  #internalVariables = $state<InternalVariable[]>([]);
  #subscribers: (SubscribeFn | undefined)[] = [];

  constructor(defaultVariables?: Variable[]) {
    if (!defaultVariables) {
      return;
    }
    this.#internalVariables = defaultVariables.map(variable => new InternalVariable(variable));
  }

  get internalVariables() {
    return this.#internalVariables;
  }

  public log() {
    $inspect(this.#internalVariables);
  }

  public subscribe(fn: SubscribeFn) {
    for (const internalVariable of this.#internalVariables) {
      internalVariable.subscribe(fn);
    }
    this.#subscribers.push(fn);
  }

  public addInternalVariable(internalVariable?: InternalVariable) {
    if (internalVariable) {
      const temp = internalVariable.clone();
      for (const subscriber of this.#subscribers) {
        temp.subscribe(subscriber);
      }
      this.#internalVariables.push(temp);
      for (const subscriber of this.#subscribers) {
        subscriber?.(temp, "CREATE");
      }
      return;
    }

    const temp = InternalVariable.default();
    for (const subscriber of this.#subscribers) {
      temp.subscribe(subscriber);
    }
    this.#internalVariables.push(temp);
    for (const subscriber of this.#subscribers) {
      subscriber?.(temp, "CREATE");
    }
  }

  public removeInternalVariable(psudoId: InternalVariable["psudoId"]) {
    const indexToRemove = this.#internalVariables.findIndex(value => value.psudoId === psudoId);

    if (indexToRemove < 0) {
      return;
    }

    const temp = this.#internalVariables.splice(indexToRemove, 1);
    for (const subscriber of this.#subscribers) {
      subscriber?.(temp[0], "DELETE");
    }
  }

  public clearVariables() {
    for (const internalVariable of this.#internalVariables) {
      for (const subscriber of this.#subscribers) {
        subscriber?.(internalVariable, "DELETE");
      }
    }
    this.#internalVariables.length = 0;
  }

  public toVariables() {
    return this.#internalVariables.map(v => v.toVariable());
  }
}

export function setInternalVariablesContext(
  variablesContextKey: symbol,
  ...options: ConstructorParameters<typeof InternalVariables>
) {
  return setContext(variablesContextKey, new InternalVariables(...options));
}

export function getInternalVariablesContext(variablesContextKey: symbol) {
  const context = getContext<ReturnType<typeof setInternalVariablesContext> | undefined>(variablesContextKey);

  if (!context) {
    throw new Error(
      `Could not get internal variables context from key: ${variablesContextKey.toString()}`,
    );
  }
  return context;
}
