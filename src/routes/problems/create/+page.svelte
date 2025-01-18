<script lang="ts">
import TagSearch from "$components/TagSearch.svelte";
import { createProblem } from "$features/problems/api/client";
import QuestionTypeSelect from "$features/problems/components/QuestionTypeSelect.svelte";
import { type CreateIssues } from "$features/problems/schemas/create";
import Variables from "$features/variables/components/Variables.svelte";
import Variants from "$features/variants/components/Variants.svelte";
import type { ErrorObject } from "$lib/error";
import { getToaster } from "$lib/toaster.svelte";

let tagSearchRef = $state<TagSearch>();
let variablesRef = $state<Variables>();
let variantsRef = $state<Variants>();
let questionTypeRef = $state<QuestionTypeSelect>();

const toaster = getToaster();
let failureResopnse = $state<CreateIssues & { message?: string }>();

function setFailureResponse(error?: ErrorObject) {
  if (error?.type === "validation-error") {
    failureResopnse = {
      ...error.extra,
      message: error?.message,
    };
  } else {
    failureResopnse = {
      message: error?.message,
    };
  }
}

function resetForm(formElement: HTMLFormElement) {
  formElement.reset();
  tagSearchRef?.clearSelectedTags();
  variablesRef?.clearVariables();
}

async function onFormSubmit(
  event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement },
) {
  event.preventDefault();
  // Taking reference because current element becomes null for some reason down in function
  const formElement = event.currentTarget;
  const formData = new FormData(formElement);

  const variables = variablesRef?.getVariables();
  if (variables === undefined) {
    toaster.error("Variable ref not set");
    return;
  }

  const problemStatement = formData.get("problemStatement")?.toString() ?? "";
  const hint = formData.get("hint")?.toString() ?? "";
  const explanation = formData.get("explanation")?.toString() ?? "";
  const questionType = questionTypeRef?.getSelectedVariable() ?? "";
  const tags = tagSearchRef?.getTagIdStrings() ?? "";
  const equations = variables
    .filter(v => v.typ === "equation").map(v => v.defaultValue)
    .join(",");
  const images = variables.filter(v => v.typ === "image").map(v =>
    v.defaultValue
  ).join(",");

  const variants = variantsRef?.getVariants();
  const concepts = variables
    .filter(v => v.typ === "concept").map(v => v.defaultValue)
    .join(",");
  const problems = variables
    .filter(v => v.typ === "problem").map(v => v.defaultValue)
    .join(",");

  console.log(formData.values());
  console.log({
    problemStatement,
    hint: hint.trim().length === 0 ? null : hint,
    questionType,
    tags,
    equations,
    images,
    concepts,
    problems,
    variables,
    variants,
    explanation: explanation.trim().length === 0 ? null : explanation,
  });
  return;
  const maybeProblems = await createProblem({
    problemStatement,
    hint: hint.trim().length === 0 ? null : hint,
    questionType,
    tags,
    equations,
    images,
    concepts,
    problems,
    variables,
    variants,
    explanation: explanation.trim().length === 0 ? null : explanation,
  });

  if (maybeProblems.err) {
    toaster.error(
      maybeProblems.unwrapErr().message ?? "Internal Server Error",
    );
    const errorObj = maybeProblems.unwrapErr().error;
    console.error(errorObj);
    setFailureResponse(errorObj);
    return;
  }

  if (maybeProblems.isOk()) {
    toaster.success("Problem saved");
    resetForm(formElement);
  }
}
</script>

<form
  onsubmit={onFormSubmit}
  class="mx-auto grid grid-cols-1 gap-4"
>
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
    ></textarea>
    {#if failureResopnse?.problemStatement}
      <div class="text-error">
        {failureResopnse.problemStatement[0]}
      </div>
    {/if}
  </label>

  <label>
    <div>
      Hint <span aria-label="optional"></span>
    </div>
    <textarea
      class="w-full text-xl h-12 min-h-12 p-2 rounded border border-solid border-base-content"
      placeholder=""
      name="hint"
    ></textarea>
    {#if failureResopnse?.hint}
      <div class="text-error">
        {failureResopnse.hint[0]}
      </div>
    {/if}
  </label>

  <QuestionTypeSelect bind:this={questionTypeRef} name="questionType" />

  <TagSearch bind:this={tagSearchRef} />
  {#if failureResopnse?.tags}
    <div class="text-error">
      {failureResopnse.tags[0]}
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
    ></textarea>
    {#if failureResopnse?.explanation}
      <div class="text-error">
        {failureResopnse.explanation[0]}
      </div>
    {/if}
  </label>

  <Variables
    bind:this={variablesRef}
    allowedValues={["text", "image", "equation", "concept", "problem"]}
  />

  <Variants bind:this={variantsRef} variables={variablesRef?.getVariables()} />

  <button
    class="px-4 font-semibold active:scale-98 active:transition-all bg-primary text-primary-content py-2 rounded-full"
    type="submit"
  >
    Submit
  </button>
</form>
