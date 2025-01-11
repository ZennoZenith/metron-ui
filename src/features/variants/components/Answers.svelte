<script lang="ts">
import { PlusCircled, Trash } from "$icons";
import type { AnswerCreate } from "$schemas/answer";

interface Props {
  answers: AnswerCreate[];
  defaultAnswer?: boolean;
  atleastOne?: boolean;
}

const DEFAULT_ANSWER: AnswerCreate = {
  answer: "",
  explanation: "",
};

const {
  answers = $bindable([]),
  defaultAnswer = false,
  atleastOne = false,
}: Props = $props();

if (defaultAnswer) {
  answers.push(structuredClone(DEFAULT_ANSWER));
}

function addAnswer() {
  answers.push(DEFAULT_ANSWER);
}

function removeAnswer(indexToRemove: number): any {
  if (atleastOne && answers.length === 1) return;

  answers.splice(indexToRemove, 1);
}
</script>
{#each answers as answer, index}
  <div class="border rounded p-2 relative">
    <label>
      <div>
        Answer <span class="text-error md:" aria-label="required"> * </span>
      </div>
      <textarea
        class="w-full h-11 min-h-11 p-2 rounded border border-solid border-base-content"
        placeholder="Answer"
        name="answer"
        required
        bind:value={answer.answer}
      ></textarea>
    </label>
    <label>
      <div>Explanation</div>
      <textarea
        class="w-full h-11 min-h-11 p-2 rounded border border-solid border-base-content"
        placeholder="Explanation"
        name="explanation"
        bind:value={answer.explanation}
      ></textarea>
    </label>
    {#if !atleastOne || answers.length !== 1}
      <button
        class="absolute -right-3 -top-3 bg-error text-error-content rounded-full p-1 hover:bg-magnum-100 focus:shadow-magnum-400"
        onclick={() => removeAnswer(index)}
        type="button"
      >
        <Trash class="text-sm" />
      </button>
    {/if}
  </div>
{/each}
<div>
  <button
    class="flex items-center gap-2 bg-secondary text-secondary-content px-2 py-1 rounded-full"
    type="button"
    onclick={addAnswer}
  >
    Add answer
  </button>
</div>

<style>
label {
  display: grid;
  grid-template-columns: 8rem auto;
  margin-bottom: 0.25rem;
  align-items: center;
}

@media (width < 48rem) {
  label {
    display: block;
  }
}
</style>
