<script lang="ts">
import VariableValueSelect from "$features/variables/components/VariableValueSelect.svelte";
import { PlusCircled, Trash } from "$icons";
import type { VariableArray } from "$schemas/variable";
import type { VariantCreate } from "$schemas/variant";
import Answers from "./Answers.svelte";

interface Props {
  variables: VariableArray;
}

const {
  variables = [],
}: Props = $props();

let lastGreatestIndex = 1;

const DEFAULT_VARIANT: VariantCreate = {
  correctAnswers: [{ answer: "", explanation: "" }],
  incorrectAnswers: [],
  variableValues: [],
};

const variants = $state<[number, VariantCreate][]>(
  [[lastGreatestIndex, structuredClone(DEFAULT_VARIANT)]],
);

function addVariant() {
  lastGreatestIndex += 1;
  variants.push([
    lastGreatestIndex,
    structuredClone(DEFAULT_VARIANT),
  ]);
}

function removeVariant(index: number): any {
  if (variants.length === 1) return;
  const indexToRemove = variants.findIndex(value => value[0] === index);
  if (indexToRemove < 0) {
    return;
  }
  variants.splice(indexToRemove, 1);
}
</script>

<div class="grid grid-cols-1 gap-2 relative">
  {#each variants as [indexId, variant] (indexId)}
    <div
      class="relative grid grid-cols-1 gap-1 p-2 border rounded hover:bg-neutral"
    >
      <div class="border rounded p-2 grid grid-cols-1 gap-2">
        <div>Correct answer(s)</div>
        <Answers bind:answers={variant.correctAnswers} atleastOne />
      </div>
      <div class="border rounded p-2 grid grid-cols-1 gap-2">
        <div>Incorrect answer(s)</div>
        <Answers bind:answers={variant.incorrectAnswers} />
      </div>
      <div class="border rounded p-2 grid grid-cols-1 gap-2">
        <div>Variable value(s)</div>
        <VariableValueSelect {variables} />
      </div>
      {#if variants.length !== 1}
        <button
          class="absolute -right-3 -top-3 bg-error text-error-content rounded-full p-1 hover:bg-magnum-100 focus:shadow-magnum-400"
          onclick={() => removeVariant(indexId)}
          type="button"
        >
          <Trash class="text-sm" />
        </button>
      {/if}
    </div>
  {/each}
</div>

<div>
  <button
    class="mt-2 flex items-center gap-2 bg-secondary text-secondary-content px-2 py-1 rounded-full"
    onclick={addVariant}
    type="button"
  >
    Add variant <PlusCircled />
  </button>
</div>
