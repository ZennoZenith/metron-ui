<script lang="ts">
import { Switch } from "$components/melt";
import { IdCard, MagnifyingGlass, PlusCircled, Trash } from "$icons";
import type { VariableType } from "$type/variables";
import { Debounce } from "$utils/debounce";
import VariableSearch, { type SearchResult } from "./VariableSearch.svelte";
import VariableSelect from "./VariableSelect.svelte";

const debounce = new Debounce();
let lastGreatestIndex = 1;

interface Props {
  disableNullable?: boolean;
  allowedVariableTypes?:
    | ["image", "equation", "concept", "problem", "string"]
    | ({} & string[]);
}

interface Variable {
  name?: string;
  typ?: VariableType | ({} & string);
  nullable?: boolean;
  defaultValue?: string | null;
  defaultValueLabel?: string | null;
}
const DEFAULT_VARIABLE = {
  name: undefined,
  typ: undefined,
  nullable: false,
  defaultValue: null,
  defaultValueLabel: undefined,
};
const variables = $state<[number, Partial<Variable>][]>([
  [1, structuredClone(DEFAULT_VARIABLE)],
]);
const {
  disableNullable = false,
  allowedVariableTypes = [
    "image",
    "equation",
    "concept",
    "problem",
    "string",
  ],
}: Props = $props();

let variableImageSearchRef = $state<VariableSearch>();
let currentSelectVariableIndex = $state<number>();
const currentSelectedVariable = $derived(
  variables.find(v => v[0] === currentSelectVariableIndex)?.[1],
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

function onImageSelect(searchResult?: SearchResult) {
  if (!searchResult) return;
  const currentVariableIndex = variables.findIndex(v =>
    v[0] === currentSelectVariableIndex
  );
  if (currentVariableIndex === -1) return;

  variables[currentVariableIndex][1].defaultValue = searchResult.id;
  variables[currentVariableIndex][1].defaultValueLabel = searchResult.title;
}

export function getVariables() {
  return $state.snapshot(variables.map(v => v[1]));
}

export function clearVariables() {
  variables.length = 0;
  lastGreatestIndex = 1;
  variables.push(
    [lastGreatestIndex, structuredClone(DEFAULT_VARIABLE)],
  );
}
</script>

<VariableSearch
  variableType={currentSelectedVariable?.typ}
  bind:this={variableImageSearchRef}
  onResponse={onImageSelect}
/>

<div class="grid grid-cols-1 gap-1 p-4">
  {#each variables as [indexId, variable], index (indexId)}
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
        {allowedVariableTypes}
        onChange={({ next }) => {
          variable.typ = next?.value;
          currentSelectVariableIndex = undefined;
          variable.defaultValue = undefined;
          variable.defaultValueLabel = undefined;
        }}
      />
      <Switch
        label="Is nullable? "
        disabled={disableNullable}
        defaultChecked={variable.nullable}
        onChange={state => variable.nullable = state}
      />
      {#if variable.typ === "string"}
        <input
          type="text"
          class="w-full h-10 outline-none"
          placeholder="Default value"
          value={variable.defaultValue}
          oninput={event => {
            debounce.debounceAsync((value: string) => {
              variable.defaultValue = value;
            })(event.currentTarget.value);
          }}
        >
      {:else if variable.typ !== undefined}
        <div class="w-full h-10 outline-none border-1 flex items-center gap-1">
          <button
            class="px-2 flex items-center gap-1 h-full grow"
            type="button"
          >
            <IdCard class="text-warning shrink" />
            <div class="grow text-left">
              {variable.defaultValueLabel}
            </div>
          </button>
          <button
            type="button"
            class="h-full text-success px-2"
            onclick={() => {
              currentSelectVariableIndex = indexId;
              variableImageSearchRef?.setOpenState();
            }}
          >
            <MagnifyingGlass />
          </button>
        </div>
      {:else}
        <div class="w-full h-10 outline-none"></div>
      {/if}
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
