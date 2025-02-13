<script lang="ts">
import { VARIABLE_TYPES, type VariableType } from "$api/schemas/variable";
import { IdCard, MagnifyingGlass } from "$icons";
import { isEmptyString, uuidv4 } from "$utils/helpers";
import VariableSearch, { type SearchResult } from "./VariableSearch.svelte";

interface Props {
  internalVariablePsudoId: Readonly<string>;
  typ: VariableType;
  defaultLabel?: string;
  defaultValue?: string;
  disabled?: boolean;
  onChange?: (value: string, label: string) => void;
}

const {
  internalVariablePsudoId: _internalVariablePsudoId = uuidv4(),
  defaultValue,
  defaultLabel,
  disabled = false,
  typ,
  onChange = () => {},
}: Props = $props();

let label = $state($state.snapshot(defaultLabel) ?? "");
let value = $state($state.snapshot(defaultValue) ?? "");

let variableSearchRef = $state<VariableSearch>();

function onVariableSearchSelect(searchResult?: SearchResult) {
  if (!searchResult) return;

  value = searchResult.id;
  label = searchResult.title;
  onChange(searchResult.id, searchResult.title);
}
</script>

<VariableSearch
  variableType={typ}
  bind:this={variableSearchRef}
  onResponse={onVariableSearchSelect}
/>

{#if disabled}
  <div>
    Value: <span>{isEmptyString(label) ? "<empty>" : label}</span>
  </div>
{:else if typ === "text"}
  <input
    type="text"
    class="w-full h-10 outline-none"
    placeholder="Default value"
    {value}
    oninput={event => {
      value = event.currentTarget.value;
      label = event.currentTarget.value;
      onChange(event.currentTarget.value, event.currentTarget.value);
    }}
  >
{:else if VARIABLE_TYPES.includes(typ)}
  <div class="w-full h-10 outline-none border-1 flex items-center gap-1">
    <button
      class="px-2 flex items-center gap-1 h-full grow"
      type="button"
    >
      <IdCard class="text-warning shrink" />
      <div class="grow text-left">
        {label}
      </div>
    </button>
    <button
      type="button"
      class="h-full text-success px-2"
      onclick={() => variableSearchRef?.setOpenState()}
    >
      <MagnifyingGlass />
    </button>
  </div>
{:else}
  <div class="w-full h-10 outline-none"></div>
{/if}
