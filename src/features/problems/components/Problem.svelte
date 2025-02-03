<script lang="ts">
import TagSearch from "$components/TagSearch.svelte";
import Variables from "$features/variables/components/Variables.svelte";
import {
  InternalProblem,
  setProblemContext,
} from "$schemas/internal-problem.svelte";
import {
  InternalVariable,
  InternalVariables,
  setInternalVariablesContext,
} from "$schemas/internal-variable.svelte";
import { Debounce } from "$utils/debounce";

import { DEBOUNCE_OVERIDE_TIME_MSEC } from "$constants";
import Variants from "$features/variants/components/Variants.svelte";
import {
  InternalVariants,
  setInternalVariantsContext,
} from "$schemas/internal-variant.svelte";
import type { SubscribeAction } from "$type";
import type { Problem } from "$type/problems";
import QuestionTypeSelect from "./QuestionTypeSelect.svelte";

type Props = {
  defaultProblem?: Problem;
  disabled?: boolean;
  onSubmit?: (
    a: InternalProblem,
    b: InternalVariables,
    c: InternalVariants,
  ) => void;
};

const { defaultProblem, onSubmit = () => {} }: Props = $props();
const PROBLEM_KEY = Symbol("PROBLEM");
const VARIABLE_KEY = Symbol("VARIABLE");
const VARIANT_KEY = Symbol("VARIANT");
const debounce = new Debounce();

const internalProblem = setProblemContext(PROBLEM_KEY, defaultProblem);
const internalVariables = setInternalVariablesContext(VARIABLE_KEY);
const internalVariants = setInternalVariantsContext(
  VARIANT_KEY,
  internalVariables,
);
internalVariables.subscribe((internalVariable, action) => {
  debounce.debounceAsync((value: InternalVariable, act: SubscribeAction) => {
    // console.log(`Action: ${act}`);
    // value.log();
    internalVariants.internalVariableAction(value, act);
  }, DEBOUNCE_OVERIDE_TIME_MSEC)(internalVariable, action);
});
</script>

<form
  onsubmit={event => {
    event.preventDefault();
    onSubmit(internalProblem, internalVariables, internalVariants);
  }}
  class="mx-auto grid grid-cols-1 gap-4"
>
  <input type="hidden" name="id" bind:value={internalProblem.id}>
  <label>
    <div>
      Problem Statement
      <span class="text-error" aria-label="required"> * </span>
    </div>
    <textarea
      class="w-full text-xl h-36 min-h-12 p-2 rounded border border-solid border-base-content"
      placeholder=""
      name="problemStatement"
      required
      bind:value={internalProblem.problemStatement}
    ></textarea>
  </label>

  <label>
    <div>
      Hint <span aria-label="optional"></span>
    </div>
    <textarea
      class="w-full text-xl h-12 min-h-12 p-2 rounded border border-solid border-base-content"
      placeholder=""
      name="hint"
      bind:value={internalProblem.hint}
    ></textarea>
  </label>

  <QuestionTypeSelect
    name="questionType"
    defaultValue="MCQ"
    onChange={value => internalProblem.questionType = value}
  />

  <TagSearch onChange={value => internalProblem.tags = value} />

  <label>
    <div>
      Explanation <span aria-label="optional"></span>
    </div>
    <textarea
      class="w-full text-xl min-h-12 h-52 p-2 rounded border border-solid border-base-content"
      placeholder=""
      name="explanation"
      bind:value={internalProblem.explanation}
    ></textarea>
  </label>

  <Variables variablesContextKey={VARIABLE_KEY} />

  <Variants variantsContextKey={VARIANT_KEY} />

  <button
    class="px-4 font-semibold active:scale-98 active:transition-all bg-primary text-primary-content py-2 rounded-full"
    type="submit"
  >
    Submit
  </button>
</form>
