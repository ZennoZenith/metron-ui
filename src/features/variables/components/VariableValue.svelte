<script lang="ts">
import { IdCard, MagnifyingGlass } from "$icons";
import {
  InternalVariable,
  type InternalVariableValue,
  VARIABLE_TYPES,
  type VariableType,
} from "$schemas/variable.svelte";
import VariableSearch, { type SearchResult } from "./VariableSearch.svelte";

interface Props {
  internalVariable: Readonly<InternalVariable>;
  onChange?: (variableValue: InternalVariableValue) => void;
}

const { internalVariable, onChange = () => {} }: Props = $props();
let variableImageSearchRef = $state<VariableSearch>();

function onVariableSearchSelect(searchResult?: SearchResult) {
  if (!searchResult) return;

  onChange({
    name: $state.snapshot(internalVariable.name),
    value: searchResult.id,
    label: searchResult.title,
  });
}
</script>

<VariableSearch
  variableType={internalVariable.typ}
  bind:this={variableImageSearchRef}
  onResponse={onVariableSearchSelect}
/>

{#if internalVariable?.typ === "text"}
  <input
    type="text"
    class="w-full h-10 outline-none"
    placeholder="Default value"
    value={internalVariable.value}
    oninput={event => {
      onChange({
        name: $state.snapshot(internalVariable.name),
        value: event.currentTarget.value,
        label: event.currentTarget.value,
      });
    }}
  >
{:else if VARIABLE_TYPES.includes(internalVariable?.typ as VariableType)}
  <div class="w-full h-10 outline-none border-1 flex items-center gap-1">
    <button
      class="px-2 flex items-center gap-1 h-full grow"
      type="button"
    >
      <IdCard class="text-warning shrink" />
      <div class="grow text-left">
        {internalVariable.label}
      </div>
    </button>
    <button
      type="button"
      class="h-full text-success px-2"
      onclick={() => variableImageSearchRef?.setOpenState()}
    >
      <MagnifyingGlass />
    </button>
  </div>
{:else}
  <div class="w-full h-10 outline-none"></div>
{/if}
