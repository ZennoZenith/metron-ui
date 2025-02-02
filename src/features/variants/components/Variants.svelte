<script lang="ts">
import VariableValueSelect from "$features/variables/components/VariableValueSelect.svelte";
import { PlusCircled, Trash } from "$icons";
import { InternalVariable } from "$schemas/variable.svelte";
import { InternalVariant } from "../schema/InternalVariant";
import Answers from "./Answers.svelte";

interface Props {
  internalVariables: Readonly<InternalVariable[]>;
  onChange?: (internalVariant: InternalVariant[]) => void;
}

const {
  internalVariables = [],
  onChange = () => {},
}: Props = $props();

$inspect(internalVariables);

const internalVariants = $state<InternalVariant[]>([InternalVariant.default()]);

function addVariant() {
  internalVariants.push(InternalVariant.default());
  onChange(internalVariants);
}

function removeVariant(id: string): any {
  if (internalVariants.length === 1) return;
  const indexToRemove = internalVariants.findIndex(value =>
    value.psudoId === id
  );
  if (indexToRemove < 0) {
    return;
  }
  internalVariants.splice(indexToRemove, 1);
  onChange(internalVariants);
}

// export function getVariants(): VariantCreate[] {
//   return $state.snapshot(
//     variants.map(localVariant => {
//       return {
//         correctAnswers: localVariant.correctAnswers,
//         incorrectAnswers: localVariant.incorrectAnswers,
//         variableValues: localVariant.variableValueSelectRef?.getVariableValues()
//           ?? [],
//       };
//     }),
//   );
// }
</script>

<div class="grid grid-cols-1 gap-2 relative">
  {#each internalVariants as internalVariant (internalVariant.psudoId)}
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
            onChange(internalVariants);
          }}
        />
      </div>
      <div class="border rounded p-2 grid grid-cols-1 gap-2">
        <div>Incorrect answer(s)</div>
        <Answers
          defaultAnswers={internalVariant.incorrectAnswers}
          onChange={v => {
            internalVariant.incorrectAnswers = v;
            onChange(internalVariants);
          }}
        />
      </div>
      <div class="border rounded p-2 grid grid-cols-1 gap-2">
        <div>Variable value(s)</div>
        <VariableValueSelect
          internalVariables={internalVariables}
          onChange={variableValues => {
            internalVariant.variableValues = variableValues;
            onChange(internalVariants);
          }}
        />
      </div>
      {#if internalVariants.length !== 1}
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
