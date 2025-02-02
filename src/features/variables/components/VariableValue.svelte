<script lang="ts">
import { IdCard, MagnifyingGlass } from "$icons";
import { VARIABLE_TYPES, type VariableType } from "$schemas/variable.svelte";
import { InternalVariableValue } from "../schemas/variable-values.svelte";
import VariableSearch, { type SearchResult } from "./VariableSearch.svelte";

interface Props {
  internalVariableValue: InternalVariableValue;
}

const { internalVariableValue = new InternalVariableValue() }: Props = $props();

let variableSearchRef = $state<VariableSearch>();

function onVariableSearchSelect(searchResult?: SearchResult) {
  if (!searchResult) return;

  internalVariableValue.value = searchResult.id;
  internalVariableValue.label = searchResult.title;
}
</script>

<VariableSearch
  variableType={internalVariableValue.typ}
  bind:this={variableSearchRef}
  onResponse={onVariableSearchSelect}
/>

{#if internalVariableValue?.typ === "text"}
  <input
    type="text"
    class="w-full h-10 outline-none"
    placeholder="Default value"
    value={internalVariableValue.value}
    oninput={event => {
      internalVariableValue.value = event.currentTarget.value;
      internalVariableValue.label = event.currentTarget.value;
    }}
  >
{:else if VARIABLE_TYPES.includes(internalVariableValue?.typ as VariableType)}
  <div class="w-full h-10 outline-none border-1 flex items-center gap-1">
    <button
      class="px-2 flex items-center gap-1 h-full grow"
      type="button"
    >
      <IdCard class="text-warning shrink" />
      <div class="grow text-left">
        {internalVariableValue.label}
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
