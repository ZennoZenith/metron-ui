<script lang="ts">
import VariableValueSelect from "$features/variables/components/VariableValueSelect.svelte";
import { PlusCircled, Trash } from "$icons";
import { type VariableArray, VariableLoose } from "$schemas/variable";
import type { VariantUpdate } from "$schemas/variant";
import type { Problem } from "$type/problems";
import Answers from "./Answers.svelte";

interface Props {
  variables: VariableArray;
  defaultProblem?: Problem;
}

const {
  variables = [],
  defaultProblem,
}: Props = $props();

let lastGreatestIndex = 1;

interface LocalVariant {
  id: VariantUpdate["id"];
  correctAnswers: VariantUpdate["correctAnswers"];
  incorrectAnswers: VariantUpdate["incorrectAnswers"];
  variableValueSelectRef?: VariableValueSelect;
}

const DEFAULT_VARIANT: LocalVariant = {
  id: undefined,
  correctAnswers: [{ answer: "", explanation: undefined }],
  incorrectAnswers: [],
  variableValueSelectRef: undefined,
};

const variants = $state<[number, LocalVariant][]>(
  (() => {
    if (defaultProblem) {
      const temp: [number, LocalVariant][] = [];
      defaultProblem.variants.forEach(v => {
        temp.push([lastGreatestIndex, {
          id: v.id,
          correctAnswers: v.correctAnswers,
          incorrectAnswers: v.incorrectAnswers,
          variableValueSelectRef: undefined,
        }]);
        lastGreatestIndex += 1;
      });
      return temp;
    }
    return [[lastGreatestIndex, structuredClone(DEFAULT_VARIANT)]];
  })(),
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

export function getVariants(): VariantUpdate[] {
  return $state.snapshot(
    variants.map(v => {
      return {
        id: v[1].id,
        correctAnswers: v[1].correctAnswers,
        incorrectAnswers: v[1].incorrectAnswers,
        variableValues: v[1].variableValueSelectRef?.getVariableValues() ?? [],
      };
    }),
  );
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
        <VariableValueSelect
          bind:this={variant.variableValueSelectRef}
          variables={defaultProblem
          ? VariableLoose.fromProblemVariantToArray(defaultProblem, variant.id)
          : VariableLoose.fromVariablesToArray(variables)}
        />
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
