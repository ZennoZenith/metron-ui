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

const { defaultProblem, disabled = false, onSubmit = () => {} }: Props =
  $props();
const PROBLEM_KEY = Symbol("PROBLEM");
const VARIABLE_KEY = Symbol("VARIABLE");
const VARIANT_KEY = Symbol("VARIANT");
const debounce = new Debounce();

console.log(defaultProblem);

const internalProblem = setProblemContext(PROBLEM_KEY, defaultProblem);
const internalVariables = setInternalVariablesContext(
  VARIABLE_KEY,
  addLabelToVariable(defaultProblem),
);
const internalVariants = setInternalVariantsContext(
  VARIANT_KEY,
  internalVariables,
  defaultProblem,
);
internalVariables.subscribe((internalVariable, action) => {
  if (action === "UPDATE") {
    debounce.debounceAsync((value: InternalVariable, act: SubscribeAction) => {
      // console.log(`Action: ${act}`);
      // value.log();
      internalVariants.internalVariableAction(value, act);
    }, DEBOUNCE_OVERIDE_TIME_MSEC)(internalVariable, action);
  } else {
    internalVariants.internalVariableAction(internalVariable, action);
  }
});

function addLabelToVariable(problem?: Problem) {
  if (!problem) return undefined;

  return problem.variables.map(variable => {
    const label = extractLabel(
      variable,
      problem.equations,
      problem.images,
      problem.concepts,
      problem.problems,
    );

    return {
      ...variable,
      value: variable.defaultValue,
      label,
    };
  });
}

function extractLabel(
  variable: Problem["variables"][number],
  equations: Problem["equations"],
  images: Problem["images"],
  concepts: Problem["concepts"],
  problems: Problem["problems"],
) {
  switch (variable.typ) {
    case "image":
      return images.find(v => v.id === variable.defaultValue)?.title;
    case "equation":
      return equations.find(v => v.id === variable.defaultValue)?.title;
    case "concept":
      return concepts.find(v => v.id === variable.defaultValue)?.title;
    case "problem":
      return problems.find(v => v.id === variable.defaultValue)
        ?.problemStatement;
    default:
      return undefined;
  }
}
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
      {disabled}
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
      {disabled}
    ></textarea>
  </label>

  <QuestionTypeSelect
    name="questionType"
    defaultValue="MCQ"
    {disabled}
    onChange={value => internalProblem.questionType = value}
  />

  {#if !disabled}
    <TagSearch
      defaultSelectedTags={defaultProblem?.tags}
      onChange={value => internalProblem.tags = value}
    />
  {:else if defaultProblem}
    <div
      class="flex p-2 gap-2 flex-wrap border rounded border-solid border-base-content min-h-fit items-center"
    >
      {#each defaultProblem.tags as tag}
        <span
          class="bg-info text-info-content font-semibold px-3 rounded-full flex items-center gap-1"
        >
          {tag.title}
        </span>
      {/each}
    </div>
  {/if}

  <label>
    <div>
      Explanation <span aria-label="optional"></span>
    </div>
    <textarea
      class="w-full text-xl min-h-12 h-52 p-2 rounded border border-solid border-base-content"
      placeholder=""
      name="explanation"
      bind:value={internalProblem.explanation}
      {disabled}
    ></textarea>
  </label>

  <Variables variablesContextKey={VARIABLE_KEY} {disabled} />

  <Variants variantsContextKey={VARIANT_KEY} {disabled} />

  <button
    class="px-4 font-semibold active:scale-98 active:transition-all bg-primary text-primary-content py-2 rounded-full"
    type="submit"
  >
    Submit
  </button>
</form>
