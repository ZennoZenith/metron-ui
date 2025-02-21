import { Log } from "$lib/logger";
import { uuidv4 } from "$utils/helpers";
import { getContext, setContext } from "svelte";
import type { InfoSectionUpdateSchema } from "./internal-info-section";

export class InternalForm {
  readonly _tag = "InternalForm" as const;
  // id: string = $state("");
  #psudoId: string;

  constructor() {
    // this.internalVariables.onChange(v => {});
    this.#psudoId = uuidv4();
    // this.id = form.id ?? "";
  }

  get psudoId() {
    return this.#psudoId;
  }

  public log() {
    Log.info({
      // id: $state.snapshot(this.id),
      psudoId: this.#psudoId,
    });
  }

  handleInfoSectionUpdate(value: InfoSectionUpdateSchema) {
    console.log(value);
  }
}

export function setFormContext(
  formContextKey: symbol,
  ...options: ConstructorParameters<typeof InternalForm>
) {
  return setContext(formContextKey, new InternalForm(...options));
}

export function getFormContext(formContextKey: symbol) {
  const context = getContext<ReturnType<typeof setFormContext> | undefined>(formContextKey);

  if (!context) {
    throw new Error(
      `Could not get internal form context from key: ${formContextKey.toString()}`,
    );
  }
  return context;
}
