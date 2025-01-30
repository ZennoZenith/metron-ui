<script lang="ts">
import { IdCard, MagnifyingGlass } from "$icons";
import {
  InternalVariable,
  VARIABLE_TYPES,
  type VariableType,
} from "$schemas/variable.svelte";
import VariableSearch, { type SearchResult } from "./VariableSearch.svelte";

interface Props {
  internalVariable: InternalVariable;
  oninput?: (value: string) => void;
}
const { internalVariable, oninput = () => {} }: Props = $props();
let variableImageSearchRef = $state<VariableSearch>();

// const reactiveVariable = $state(internalVariable);

function onVariableSelect(searchResult?: SearchResult) {
  if (!searchResult) return;

  // reactiveVariable.value = searchResult.id;
  // reactiveVariable.label = searchResult.title;
  internalVariable.value = searchResult.id;
  internalVariable.label = searchResult.title;

  oninput(searchResult.id);
}
</script>

<VariableSearch
  variableType={internalVariable?.typ}
  bind:this={variableImageSearchRef}
  onResponse={onVariableSelect}
/>

{#if internalVariable?.typ === "text"}
  <input
    type="text"
    class="w-full h-10 outline-none"
    placeholder="Default value"
    value={internalVariable.value}
    oninput={event => {
      internalVariable.value = event.currentTarget.value;
      oninput(event.currentTarget.value);
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
