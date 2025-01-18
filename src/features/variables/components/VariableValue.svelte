<script lang="ts">
import { IdCard, MagnifyingGlass } from "$icons";
import type { VariableLoose } from "$schemas/variable";
import { Debounce } from "$utils/debounce";
import VariableSearch, { type SearchResult } from "./VariableSearch.svelte";

interface Props {
  variable: VariableLoose;
  oninput?: (value: string) => void;
}
const { variable, oninput = () => {} }: Props = $props();
let variableImageSearchRef = $state<VariableSearch>();

const debounce = new Debounce();

const reactiveVariable = $state(variable);

function onImageSelect(searchResult?: SearchResult) {
  if (!searchResult) return;

  reactiveVariable.value = searchResult.id;
  reactiveVariable.label = searchResult.title;

  oninput(searchResult.id);
}
</script>

<VariableSearch
  variableType={variable?.typ}
  bind:this={variableImageSearchRef}
  onResponse={onImageSelect}
/>

{#if variable.typ === "string"}
  <input
    type="text"
    class="w-full h-10 outline-none"
    placeholder="Default value"
    value={reactiveVariable.value}
    oninput={event => {
      debounce.debounceAsync((value: string) => {
        reactiveVariable.value = value;
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
