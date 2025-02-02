<script lang="ts">
import { Switch } from "$components/melt";
import { DEBOUNCE_OVERIDE_TIME_MSEC } from "$constants";
import { PlusCircled, Trash } from "$icons";
import {
  InternalVariable,
  InternalVariables,
  type InternalVariableValue,
  VARIABLE_TYPES,
} from "$schemas/variable.svelte";
import type { VariableType } from "$type/variables";
import { Debounce } from "$utils/debounce";
import VariableSelect from "./VariableSelect.svelte";
import VariableValue from "./VariableValue.svelte";

interface Props {
  disabled?: boolean;
  // defaultInternalVariables?: Readonly<InternalVariable[]>;
  internalVariables?: Readonly<InternalVariables>;
  disableNullable?: boolean;
  allowedValues?: VariableType[];
  // onChange?: (value: InternalVariable[]) => void;
}

const {
  disableNullable = false,
  // defaultInternalVariables = [],
  internalVariables = new InternalVariables(),
  allowedValues = structuredClone(VARIABLE_TYPES),
  // onChange = () => {},
  disabled = false,
}: Props = $props();

const debounce = new Debounce();

// const internalVariables = $state<InternalVariable[]>(
//   defaultInternalVariables.map(v => v.clone()),
// );

function addInternalVariable() {
  internalVariables.addInternalVariable();
}

function removeInternalVariable(psudoId: InternalVariable["psudoId"]) {
  internalVariables.removeInternalVariable(psudoId);
}

// export function getVariables() {
//   return internalVariables.toVariables();
// }

// export function getInternalVariables(): InternalVariable[] {
//   return internalVariables.internalVariables;
// }

// export function clearVariables() {
//   internalVariables.clearVariables();
// }
</script>

<div class="grid grid-cols-1 gap-1 p-4">
  {#each internalVariables.internalVariables as
    internalVariable
    (internalVariable.psudoId)
  }
    <div class="relative grid grid-cols-1 sm:grid-cols-2 border-2 gap-2 p-2">
      <input
        type="text"
        class="w-full h-10 outline-none"
        value={internalVariable.name}
        placeholder="Variable name*"
        oninput={event => {
          debounce.debounceAsync((value: string) => {
            internalVariable.name = value;
          }, DEBOUNCE_OVERIDE_TIME_MSEC)(event.currentTarget.value);
        }}
      >
      <VariableSelect
        defaultValue={internalVariable.typ}
        {allowedValues}
        onChange={value => {
          internalVariable.typ = value;
          internalVariable.value = undefined;
          internalVariable.label = undefined;
        }}
      />
      <Switch
        label="Is nullable? "
        disabled={disableNullable}
        defaultChecked={internalVariable.nullable}
        onChange={state => {
          internalVariable.nullable = state;
        }}
      />
      <VariableValue
        internalVariable={internalVariable}
        onChange={value => {
          debounce.debounceAsync((value: InternalVariableValue) => {
            internalVariable.value = value.value;
          }, DEBOUNCE_OVERIDE_TIME_MSEC)(value);
        }}
      />
      <button
        class="absolute -right-3 top-3 bg-error text-error-content rounded-full p-1 hover:bg-magnum-100 focus:shadow-magnum-400"
        onclick={() => removeInternalVariable(internalVariable.psudoId)}
        type="button"
      >
        <Trash class="text-sm" />
      </button>
    </div>
  {/each}
  <div>
    <button
      class="flex items-center gap-2 bg-secondary text-secondary-content px-2 py-1 rounded-full"
      onclick={addInternalVariable}
      type="button"
    >
      Add variable <PlusCircled />
    </button>
  </div>
</div>
