import type { SubscribeAction } from "$type";
import type { VariableType } from "$type/variables";
import { isEmptyString, uuidv4 } from "$utils/helpers";
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

  public subscribe(fn?: SubscribeFn) {
    if (!fn) return;
    this.#subscribers.push(fn);
  }

  private notify(action: SubscribeAction = "UPDATE", internalVariable?: InternalVariable) {
    const temp = internalVariable ?? this;
    this.#subscribers.forEach(fn => fn?.(temp, action));
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

  constructor() {
  }

  public log() {
    $inspect(this.#internalVariables);
  }

  public subscribe(fn: SubscribeFn) {
    this.#internalVariables.forEach(v => v.subscribe(fn));
    this.#subscribers.push(fn);
  }

  public addInternalVariable(internalVariable?: InternalVariable) {
    if (internalVariable) {
      const temp = internalVariable.clone();
      this.#subscribers.forEach(fn => temp.subscribe(fn));
      this.#internalVariables.push(temp);
      this.#subscribers.forEach(fn => fn?.(temp, "CREATE"));
      return;
    }
    const temp = InternalVariable.default();
    this.#subscribers.forEach(fn => temp.subscribe(fn));
    this.#internalVariables.push(temp);
    this.#subscribers.forEach(fn => fn?.(temp, "CREATE"));
  }

  public removeInternalVariable(psudoId: InternalVariable["psudoId"]) {
    const indexToRemove = this.#internalVariables.findIndex(value => value.psudoId === psudoId);

    if (indexToRemove < 0) {
      return;
    }

    const temp = this.#internalVariables.splice(indexToRemove, 1);
    this.#subscribers.forEach(fn => fn?.(temp[0], "DELETE"));
  }

  public clearVariables() {
    this.#internalVariables.forEach(internalVariable =>
      this.#subscribers.forEach(sub => sub?.(internalVariable, "DELETE"))
    );
    this.#internalVariables.length = 0;
  }

  get internalVariables() {
    return this.#internalVariables as readonly InternalVariable[];
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
