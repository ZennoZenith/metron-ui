<script lang="ts">
import TagSearch from "$components/TagSearch.svelte";
import Variables from "$features/variables/components/Variables.svelte";
import Variants from "$features/variants/components/Variants.svelte";
import type { InternalVariable } from "$schemas/variable.svelte";

import type { Problem, QuestionTypeLoose } from "$type/problems";
import QuestionTypeSelect from "./QuestionTypeSelect.svelte";

type Props = {
  defaultProblem?: Problem;
};

const { defaultProblem }: Props = $props();

class ProblemManager {
  id: string = $state("");
  problemStatement: string = $state("");
  hint: string = $state("");
  questionType: QuestionTypeLoose = $state("MCQ");
  tags: string = $state("");
  equations: string = $state("");
  images: string = $state("");
  concepts: string = $state("");
  problems: string = $state("");
  #internalVariable: InternalVariable[] = $state([]);
  #variants: string = $state("");
  // #internalVariables: InternalVariables = new InternalVariables();
  explanation: string = $state("");
  createdAt: string = $state("");
  updatedAt: string = $state("");

  constructor(problem?: Problem) {
    if (!problem) {
      return;
    }
    this.id = problem.id;
  }

  log() {
    $inspect(this.#internalVariable);
  }

  internalVariableSet(value: InternalVariable[]) {
    this.#internalVariable = [...value];
    console.log(this.#internalVariable.map(v => v.value));
  }

  get internalVariable() {
    return this.#internalVariable;
  }
}

const problemManager = new ProblemManager(defaultProblem);
// problemManager.log();
</script>

<form class="mx-auto grid grid-cols-1 gap-4">
  <input type="hidden" name="id" bind:value={problemManager.id}>
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
      bind:value={problemManager.problemStatement}
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
      bind:value={problemManager.hint}
    ></textarea>
  </label>

  <QuestionTypeSelect
    name="questionType"
    defaultValue="MCQ"
    onChange={value => problemManager.questionType = value}
  />

  <TagSearch onChange={value => problemManager.tags = value} />

  <label>
    <div>
      Explanation <span aria-label="optional"></span>
    </div>
    <textarea
      class="w-full text-xl min-h-12 h-52 p-2 rounded border border-solid border-base-content"
      placeholder=""
      name="explanation"
      bind:value={problemManager.explanation}
    ></textarea>
  </label>

  <Variables onChange={value => problemManager.internalVariableSet(value)} />

  <Variants internalVariables={problemManager.internalVariable} />

  <button
    class="px-4 font-semibold active:scale-98 active:transition-all bg-primary text-primary-content py-2 rounded-full"
    type="submit"
  >
    Submit
  </button>
</form>
