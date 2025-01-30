<script lang="ts">
import { applyAction, enhance } from "$app/forms";
import { goto } from "$app/navigation";
import ConformationDialog from "$components/ConformationDialog.svelte";
import TagSearch from "$components/TagSearch.svelte";
import QuestionTypeSelect from "$features/problems/components/QuestionTypeSelect.svelte";
// import { updateProblem } from "$features/problems/api/client";
import { type UpdateIssues } from "$features/problems/schemas/update";
import Variables from "$features/variables/components/Variables.svelte";
import VariantsUpdate from "$features/variants/components/VariantsUpdate.svelte";
import { Edit, Trash } from "$icons";
import type { ErrorObject } from "$lib/error";
import { getToaster } from "$lib/toaster.svelte";
import { validateUuid } from "$schemas/uuid";
import { VARIABLE_TYPES, VariableLoose } from "$schemas/variable";
import type { SubmitFunction } from "../$types";
import type { PageData } from "./$types";

const toaster = getToaster();

let deleteFormRef = $state<HTMLFormElement>();
let tagSearchRef = $state<TagSearch>();
let variablesRef = $state<Variables>();
let variantsUpdateRef = $state<VariantsUpdate>();
let questionTypeRef = $state<QuestionTypeSelect>();
let deleteConformationDialog = $state<ConformationDialog>();
let failureResopnse = $state<UpdateIssues & { message?: string }>();

const { data }: { data: PageData } = $props();
const { problem } = data;
let edit = $state(data.edit);

const defaultVariables = VariableLoose.fromProblemToArray(problem);

function onDeleteResponse(answer: boolean) {
  if (answer) {
    deleteFormRef?.requestSubmit();
  }
}

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

const deleteProblem: SubmitFunction = (
  { formData, formElement, cancel },
) => {
  const { id } = Object.fromEntries(formData.entries());
  const isValidUuid = validateUuid(id.toString());

  if (!isValidUuid) {
    toaster.error("Invalid problem id:uuid");
    cancel();
    return;
  }

  return async ({ result }) => {
    switch (result.type) {
      case "redirect":
        goto(result.location);
        break;
      case "error":
        toaster.error(result.error.message ?? "Internal Server Error");
        break;
      case "success":
        formElement.reset();
        toaster.success(
          `Problem deleted successfully redirecting to /problems in 5sec`,
        );
        setTimeout(() => goto("/problems"), 5000);
        break;
      case "failure":
        toaster.error(result.data?.message ?? "");
        break;
    }
    await applyAction(result);
  };
};

async function onFormSubmit(
  event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement },
) {
  event.preventDefault();
  // Taking reference because current element becomes null for some reason down in function
  const formElement = event.currentTarget;
  const formData = new FormData(formElement);

  const id = formData.get("id")?.toString();
  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();
  const content = formData.get("content")?.toString();
  const tags = tagSearchRef?.getTagIdStrings();

  const variables = variablesRef?.getVariables();
  if (variables === undefined) {
    toaster.error("Variable ref not set");
    return;
  }

  const images = variables.filter(v => v.typ === "image").map(v =>
    v.defaultValue
  ).join(",");

  const equations = variables.filter(v => v.typ === "equation").map(v =>
    v.defaultValue
  )
    .join(",");

  const problems = variables.filter(v => v.typ === "problem").map(v =>
    v.defaultValue
  )
    .join(",");

  //  const maybeProblems = await updateProblem({
  //    id,
  //    title,
  //    description: description?.trim().length === 0 ? null : description,
  //    content,
  //    equations,
  //    tags,
  //    images,
  //    problems,
  //    variables,
  //  });
  //
  //  if (maybeProblems.err) {
  //    toaster.error(
  //      maybeProblems.unwrapErr().message ?? "Internal Server Error",
  //    );
  //    const errorObj = maybeProblems.unwrapErr().error;
  //    console.error(errorObj);
  //    setFailureResponse(errorObj);
  //    return;
  //  }
  //
  //  if (maybeProblems.isOk()) {
  //    toaster.success("Problem updated");
  //    setTimeout(
  //      () => window.location.replace(`/problems/${problem.id}`),
  //      5000,
  //    );
  //  }
}
</script>

<ConformationDialog
  bind:this={deleteConformationDialog}
  title="Delete Problem "
  content="Are you sure you want to delete problem"
  onResponse={onDeleteResponse}
/>
<form
  bind:this={deleteFormRef}
  method="POST"
  action="/problems?/delete"
  use:enhance={deleteProblem}
  hidden
  class="absolute w-0 h-0 overflow-hidden"
>
  <input
    name="id"
    class="inline-flex h-8 w-full flex-1 items-center justify-center rounded-sm border border-solid border-neutral px-3 leading-none"
    value={problem.id}
    type="hidden"
    aria-disabled="true"
  />
</form>

<div class="flex justify-between">
  <button
    class="flex gap-2 items-center bg-warning text-warning-content rounded-full px-4 py-1"
    onclick={() => edit = !edit}
  >
    {#if edit}
      Cancel Edit
    {:else}
      Edit
    {/if}
    <Edit />
  </button>
  {#if !edit}
    <button
      class="flex gap-2 items-center bg-error text-error-content rounded-full px-4 py-1"
      onclick={() => deleteConformationDialog?.setOpenState()}
    >
      Delete
      <Trash />
    </button>
  {/if}
</div>

<form
  onsubmit={onFormSubmit}
  class="mx-auto grid grid-cols-1 gap-4"
>
  <input type="hidden" name="id" value={problem.id}>

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
      value={problem.problemStatement}
      disabled={!edit}
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
      value={problem.hint}
      disabled={!edit}
    ></textarea>
    {#if failureResopnse?.hint}
      <div class="text-error">
        {failureResopnse.hint[0]}
      </div>
    {/if}
  </label>

  {#key edit}
    <QuestionTypeSelect
      bind:this={questionTypeRef}
      name="questionType"
      defaultValue={problem.questionType}
      disabled={!edit}
    />
  {/key}

  {#if edit}
    <TagSearch bind:this={tagSearchRef} defaultSelectedTags={problem.tags} />
    {#if failureResopnse?.tags}
      <div class="text-error">
        {failureResopnse.tags[0]}
      </div>
    {/if}
  {:else}
    <div
      class="flex p-2 gap-2 flex-wrap border rounded border-solid border-base-content min-h-fit items-center"
    >
      {#each problem.tags as tag}
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
      value={problem.explanation}
      disabled={!edit}
    ></textarea>
    {#if failureResopnse?.explanation}
      <div class="text-error">
        {failureResopnse.explanation[0]}
      </div>
    {/if}
  </label>

  <Variables
    bind:this={variablesRef}
    allowedValues={structuredClone(VARIABLE_TYPES)}
    {defaultVariables}
    disabled={!edit}
  />

  <VariantsUpdate
    bind:this={variantsUpdateRef}
    variables={variablesRef?.getVariables()}
    defaultProblem={problem}
  />

  <button
    class="px-4 font-semibold active:scale-98 active:transition-all bg-primary text-primary-content py-2 rounded-full"
    type="submit"
  >
    Submit
  </button>
</form>
