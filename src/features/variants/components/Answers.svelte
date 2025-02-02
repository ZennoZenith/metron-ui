<script lang="ts">
import { Trash } from "$icons";
import type { AnswerUpdate } from "$schemas/answer";

interface Props {
  defaultAnswers: AnswerUpdate[];
  atleastOne?: boolean;
  onChange?: (answers: AnswerUpdate[]) => void;
}

const {
  defaultAnswers = [],
  atleastOne = false,
  onChange = () => {},
}: Props = $props();

const DEFAULT_ANSWER = () => {
  return {
    id: undefined,
    answer: "",
    explanation: "",
  };
};

const answers = $state($state.snapshot(defaultAnswers));

if (atleastOne && answers.length < 1) {
  answers.push(DEFAULT_ANSWER());
}

function addAnswer() {
  answers.push(DEFAULT_ANSWER());
  onChange(answers);
}

function removeAnswer(indexToRemove: number): any {
  if (atleastOne && answers.length === 1) return;
  answers.splice(indexToRemove, 1);
  onChange(answers);
}
</script>
{#each answers as answer, index}
  <div class="border rounded p-2 relative">
    <input
      class="hidden"
      hidden
      disabled
      required
      name="id"
      value={answer.id}
    />
    <label>
      <div>
        Answer <span class="text-error md:" aria-label="required"> * </span>
      </div>
      <textarea
        class="w-full h-11 min-h-11 p-2 rounded border border-solid border-base-content"
        placeholder="Answer"
        name="answer"
        required
        value={answer.answer}
        oninput={event => {
          answer.answer = event.currentTarget.value;
          onChange(answers);
        }}
      ></textarea>
    </label>
    <label>
      <div>Explanation</div>
      <textarea
        class="w-full h-11 min-h-11 p-2 rounded border border-solid border-base-content"
        placeholder="Explanation"
        name="explanation"
        value={answer.explanation}
        oninput={event => {
          answer.explanation = event.currentTarget.value;
          onChange(answers);
        }}
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
