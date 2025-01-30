<script lang="ts">
import { Switch } from "$components/melt";
import { PlusCircled, Trash } from "$icons";
import {
  InternalVariable,
  VARIABLE_TYPES,
  type VariableArray,
} from "$schemas/variable.svelte";
import type { VariableType } from "$type/variables";
import { Debounce } from "$utils/debounce";
import VariableSelect from "./VariableSelect.svelte";
import VariableValue from "./VariableValue.svelte";

let lastGreatestIndex = 0;

interface Props {
  disabled?: boolean;
  defaultInternalVariables?: InternalVariable[];
  disableNullable?: boolean;
  allowedValues?: (VariableType | {} & string)[];
}

const {
  disableNullable = false,
  defaultInternalVariables: defaultVariables = [],
  allowedValues = structuredClone(VARIABLE_TYPES),
  disabled = false,
}: Props = $props();

const debounce = new Debounce();

const internalVariables = $state<[number, InternalVariable][]>(
  defaultVariables.map(v => {
    lastGreatestIndex += 1;
    return [lastGreatestIndex, v];
  }),
);

$inspect(internalVariables);

function addInternalVariable() {
  lastGreatestIndex += 1;
  internalVariables.push([
    lastGreatestIndex,
    InternalVariable.default(),
  ]);
}

function removeInternalVariable(index: number) {
  const indexToRemove = internalVariables.findIndex(value =>
    value[0] === index
  );
  if (indexToRemove < 0) {
    return;
  }
  internalVariables.splice(indexToRemove, 1);
}

export function getVariables() {
  return $state.snapshot(internalVariables.map(v => {
    let typ: VariableType = "text";
    if (
      (VARIABLE_TYPES as string[]).includes(
        v[1].typ ?? "",
      )
    ) {
      typ = v[1].typ as VariableType;
    }

    return {
      name: v[1].name,
      nullable: v[1].nullable ?? true,
      typ,
      defaultValue: v[1].value,
    };
  })) satisfies VariableArray as VariableArray;
}

export function getInternalVariables(): InternalVariable[] {
  return internalVariables.map(internalVariable => internalVariable[1]);
}

export function clearVariables() {
  internalVariables.length = 0;
  lastGreatestIndex = 1;
  internalVariables.push(
    [lastGreatestIndex, InternalVariable.default()],
  );
}
</script>

<div class="grid grid-cols-1 gap-1 p-4">
  {#each internalVariables as [indexId, internalVariable] (indexId)}
    <div class="relative grid grid-cols-1 sm:grid-cols-2 border-2 gap-2 p-2">
      <input
        type="text"
        class="w-full h-10 outline-none"
        value={internalVariable.name}
        placeholder="Variable name*"
        oninput={event => {
          debounce.debounceAsync((value: string) => {
            internalVariable.name = value;
          })(event.currentTarget.value);
        }}
      >
      <VariableSelect
        defaultValue={internalVariable.typ}
        {allowedValues}
        onChange={({ next }) => {
          internalVariable.typ = next?.value;
          internalVariable.value = undefined;
          internalVariable.label = undefined;
        }}
      />
      <Switch
        label="Is nullable? "
        disabled={disableNullable}
        defaultChecked={internalVariable.nullable}
        onChange={state => internalVariable.nullable = state}
      />
      <VariableValue
        internalVariable={internalVariable}
        oninput={value => {
          debounce.debounceAsync((value: string) => {
            internalVariable.value = value;
          })(value);
        }}
      />
      <button
        class="absolute -right-3 top-3 bg-error text-error-content rounded-full p-1 hover:bg-magnum-100 focus:shadow-magnum-400"
        onclick={() => removeInternalVariable(indexId)}
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
