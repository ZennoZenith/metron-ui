<script lang="ts">
import VariableValueSelect from "$features/variables/components/VariableValueSelect.svelte";
import { PlusCircled, Trash } from "$icons";
import { InternalVariants } from "../schemas/InternalVariant.svelte";
import Answers from "./Answers.svelte";

interface Props {
  internalVariants: Readonly<InternalVariants>;
}

const {
  internalVariants,
}: Props = $props();

function addVariant() {
  internalVariants.addInternalVariant();
}

function removeVariant(psudoId: string): any {
  internalVariants.removeInternalVariant(psudoId);
}
</script>

<div class="grid grid-cols-1 gap-2 relative">
  {#each internalVariants.internalVariants as
    internalVariant
    (internalVariant.psudoId)
  }
    <div
      class="relative grid grid-cols-1 gap-1 p-2 border rounded hover:bg-neutral"
    >
      <div class="border rounded p-2 grid grid-cols-1 gap-2">
        <div>Correct answer(s)</div>
        <Answers
          defaultAnswers={internalVariant.correctAnswers}
          atleastOne
          onChange={v => {
            internalVariant.correctAnswers = v;
          }}
        />
      </div>
      <div class="border rounded p-2 grid grid-cols-1 gap-2">
        <div>Incorrect answer(s)</div>
        <Answers
          defaultAnswers={internalVariant.incorrectAnswers}
          onChange={v => {
            internalVariant.incorrectAnswers = v;
          }}
        />
      </div>
      <div class="border rounded p-2 grid grid-cols-1 gap-2">
        <div>Variable value(s)</div>
        <VariableValueSelect
          requiredInternalVariableValues={internalVariant.requiredInternalVariableValues}
          optionalInternalVariableValues={internalVariant.optionalInternalVariableValues}
        />
      </div>
      {#if internalVariants.internalVariants.length !== 1}
        <button
          class="absolute -right-3 -top-3 bg-error text-error-content rounded-full p-1 hover:bg-magnum-100 focus:shadow-magnum-400"
          onclick={() => removeVariant(internalVariant.psudoId)}
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
