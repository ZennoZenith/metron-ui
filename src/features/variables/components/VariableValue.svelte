<script lang="ts">
import { IdCard, MagnifyingGlass } from "$icons";
import {
  VARIABLE_TYPES,
  VariableLoose,
  type VariableType,
} from "$schemas/variable";
import VariableSearch, { type SearchResult } from "./VariableSearch.svelte";

interface Props {
  variable: VariableLoose;
  oninput?: (value: string) => void;
}
const { variable, oninput = () => {} }: Props = $props();
let variableImageSearchRef = $state<VariableSearch>();

const reactiveVariable = $state(variable);

function onVariableSelect(searchResult?: SearchResult) {
  if (!searchResult) return;

  reactiveVariable.value = searchResult.id;
  reactiveVariable.label = searchResult.title;

  oninput(searchResult.id);
}
</script>

<VariableSearch
  variableType={variable?.typ}
  bind:this={variableImageSearchRef}
  onResponse={onVariableSelect}
/>

{#if variable.typ === "text"}
  <input
    type="text"
    class="w-full h-10 outline-none"
    placeholder="Default value"
    value={reactiveVariable.value}
    oninput={event => {
      reactiveVariable.value = event.currentTarget.value;
      oninput(event.currentTarget.value);
    }}
  >
{:else if VARIABLE_TYPES.includes(variable.typ as VariableType)}
  <div class="w-full h-10 outline-none border-1 flex items-center gap-1">
    <button
      class="px-2 flex items-center gap-1 h-full grow"
      type="button"
    >
      <IdCard class="text-warning shrink" />
      <div class="grow text-left">
        {reactiveVariable.label}
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
