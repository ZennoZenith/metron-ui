<script lang="ts">
import { Switch } from "$components/melt";
import { PlusCircled, Trash } from "$icons";
import type { VariableArray, VariableLoose } from "$schemas/variable";
import type { VariableType } from "$type/variables";
import { Debounce } from "$utils/debounce";
import VariableSelect from "./VariableSelect.svelte";
import VariableValue from "./VariableValue.svelte";

let lastGreatestIndex = 0;

interface Props {
  defaultVariables?: VariableLoose[];
  disableNullable?: boolean;
  allowedValues?: (VariableType | {} & string)[];
}

const DEFAULT_VARIABLE = {
  name: "",
  typ: undefined,
  nullable: false,
  defaultValue: null,
  defaultValueLabel: undefined,
};
const {
  disableNullable = false,
  defaultVariables = [],
  allowedValues = [
    "image",
    "equation",
    "concept",
    "problem",
    "text",
  ],
}: Props = $props();

const debounce = new Debounce();
const variables = $state<[number, VariableLoose][]>(
  defaultVariables.map(v => {
    lastGreatestIndex += 1;
    return [lastGreatestIndex, v];
  }),
);

function addVariable() {
  lastGreatestIndex += 1;
  variables.push([
    lastGreatestIndex,
    structuredClone(DEFAULT_VARIABLE),
  ]);
}

function removeVariable(index: number) {
  const indexToRemove = variables.findIndex(value => value[0] === index);
  if (indexToRemove < 0) {
    return;
  }
  variables.splice(indexToRemove, 1);
}

export function getVariables() {
  return $state.snapshot(variables.map(v => {
    let typ: VariableType = "text";
    if (
      ["image", "equation", "concept", "problem", "text"].includes(
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

export function clearVariables() {
  variables.length = 0;
  lastGreatestIndex = 1;
  variables.push(
    [lastGreatestIndex, structuredClone(DEFAULT_VARIABLE)],
  );
}
</script>

<div class="grid grid-cols-1 gap-1 p-4">
  {#each variables as [indexId, variable] (indexId)}
    <div class="relative grid grid-cols-1 sm:grid-cols-2 border-2 gap-2 p-2">
      <input
        type="text"
        class="w-full h-10 outline-none"
        value={variable?.name}
        placeholder="Variable name*"
        oninput={event => {
          debounce.debounceAsync((value: string) => {
            variable.name = value;
          })(event.currentTarget.value);
        }}
      >
      <VariableSelect
        defaultValue={variable.typ}
        {allowedValues}
        onChange={({ next }) => {
          variable.typ = next?.value;
          variable.value = undefined;
          variable.label = undefined;
        }}
      />
      <Switch
        label="Is nullable? "
        disabled={disableNullable}
        defaultChecked={variable.nullable}
        onChange={state => variable.nullable = state}
      />
      <VariableValue
        variable={$state.snapshot(variable)}
        oninput={value => {
          debounce.debounceAsync((value: string) => {
            variable.value = value;
          })(value);
        }}
      />
      <button
        class="absolute -right-3 top-3 bg-error text-error-content rounded-full p-1 hover:bg-magnum-100 focus:shadow-magnum-400"
        onclick={() => removeVariable(indexId)}
        type="button"
      >
        <Trash class="text-sm" />
      </button>
    </div>
  {/each}
  <div>
    <button
      class="flex items-center gap-2 bg-secondary text-secondary-content px-2 py-1 rounded-full"
      onclick={addVariable}
      type="button"
    >
      Add variable <PlusCircled />
    </button>
  </div>
</div>
