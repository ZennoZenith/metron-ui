<script lang="ts">
import { applyAction, enhance } from "$app/forms";
import { goto } from "$app/navigation";
import ConformationDialog from "$components/ConformationDialog.svelte";
import TagSearch from "$components/TagSearch.svelte";
import { updateConcept } from "$features/concepts/api/client";
import { type UpdateIssues } from "$features/concepts/schemas/update";
import Variables from "$features/variables/components/Variables.svelte";
import { Edit, Trash } from "$icons";
import type { ErrorObject } from "$lib/error";
import { getToaster } from "$lib/toaster.svelte";
import { validateUuid } from "$schemas/uuid";
import type { VariableType } from "$schemas/variable.svelte";
import type { Concept } from "$type/concepts";
import type { SubmitFunction } from "../$types";
import type { PageData } from "./$types";

const toaster = getToaster();

let deleteFormRef = $state<HTMLFormElement>();
let tagSearchRef = $state<TagSearch>();
let variablesRef = $state<Variables>();
let deleteConformationDialog = $state<ConformationDialog>();
let failureResopnse = $state<UpdateIssues & { message?: string }>();

const { data }: { data: PageData } = $props();
const { concept } = data;
let edit = $state(data.edit);

function getDefaultLabel(
  concept: Concept,
  typ: VariableType,
  value?: string | null,
) {
  if (value === undefined || value === null) return undefined;
  switch (typ) {
    case "image":
      return concept.images.find(v => v.id === value)?.title;
    case "equation":
      return concept.equations.find(v => v.id === value)?.title;
    case "concept":
      return concept.concepts.find(v => v.id === value)?.title;
    case "problem":
      return undefined;
  }
  return undefined;
}

const defaultVariables = concept.variables.map(v => {
  return {
    ...v,
    defaultValueLabel: getDefaultLabel(concept, v.typ, v.defaultValue),
  };
});

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

const deleteConcept: SubmitFunction = (
  { formData, formElement, cancel },
) => {
  const { id } = Object.fromEntries(formData.entries());
  const isValidUuid = validateUuid(id.toString());

  if (!isValidUuid) {
    toaster.error("Invalid concept id:uuid");
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
          `Concept deleted successfully redirecting to /concepts in 5sec`,
        );
        setTimeout(() => goto("/concepts"), 5000);
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

  const concepts = variables.filter(v => v.typ === "concept").map(v =>
    v.defaultValue
  )
    .join(",");

  const maybeConcepts = await updateConcept({
    id,
    title,
    description: description?.trim().length === 0 ? null : description,
    content,
    equations,
    tags,
    images,
    concepts,
    variables,
  });

  if (maybeConcepts.err) {
    toaster.error(
      maybeConcepts.unwrapErr().message ?? "Internal Server Error",
    );
    const errorObj = maybeConcepts.unwrapErr().error;
    console.error(errorObj);
    setFailureResponse(errorObj);
    return;
  }

  if (maybeConcepts.isOk()) {
    toaster.success("Concept updated");
    setTimeout(
      () => window.location.replace(`/concepts/${concept.id}`),
      5000,
    );
  }
}
</script>

<ConformationDialog
  bind:this={deleteConformationDialog}
  title="Delete Concept "
  content="Are you sure you want to delete concept"
  onResponse={onDeleteResponse}
/>
<form
  bind:this={deleteFormRef}
  method="POST"
  action="/concepts?/delete"
  use:enhance={deleteConcept}
  hidden
  class="absolute w-0 h-0 overflow-hidden"
>
  <input
    name="id"
    class="inline-flex h-8 w-full flex-1 items-center justify-center rounded-sm border border-solid border-neutral px-3 leading-none"
    value={concept.id}
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
  <input type="hidden" name="id" value={concept.id}>

  <label>
    <div>
      Title <span class="text-error" aria-label="required"> * </span>
    </div>
    <textarea
      id="title"
      class="w-full text-xl h-12 min-h-12 p-2 rounded border border-solid border-base-content"
      placeholder=""
      name="title"
      required
      value={concept.title}
      disabled={!edit}
    ></textarea>
    {#if failureResopnse?.title}
      <div class="text-error">
        {failureResopnse.title[0]}
      </div>
    {/if}
  </label>

  <label class="">
    <div class="label">
      Description <span aria-label="optional"></span>
    </div>
    <textarea
      id="description"
      class="w-full text-xl min-h-12 h-52 p-2 rounded border border-solid border-base-content"
      placeholder=""
      name="description"
      value={concept.description}
      disabled={!edit}
    ></textarea>
    {#if failureResopnse?.description}
      <div class="text-error">
        {failureResopnse.description[0]}
      </div>
    {/if}
  </label>

  <label class="">
    <div class="label">
      Content <span class="text-error" aria-label="required"> * </span>
    </div>
    <textarea
      id="content"
      class="w-full text-xl min-h-12 h-96 p-2 rounded border border-solid border-base-content"
      placeholder=""
      name="content"
      value={concept.content}
      required
      disabled={!edit}
    ></textarea>
    {#if failureResopnse?.content}
      <div class="text-error">
        {failureResopnse.content[0]}
      </div>
    {/if}
  </label>

  {#if edit}
    <TagSearch bind:this={tagSearchRef} defaultSelectedTags={concept.tags} />
    {#if failureResopnse?.tags}
      <div class="text-error">
        {failureResopnse.tags[0]}
      </div>
    {/if}
  {:else}
    <div
      class="flex p-2 gap-2 flex-wrap border rounded border-solid border-base-content min-h-fit items-center"
    >
      {#each concept.tags as tag}
        <span
          class="bg-info text-info-content font-semibold px-3 rounded-full flex items-center gap-1"
        >
          {tag.title}
        </span>
      {/each}
    </div>
  {/if}

  <Variables
    bind:this={variablesRef}
    allowedValues={["image", "equation", "concept"]}
    defaultInternalVariables={defaultVariables}
    disableNullable
  />

  <button
    class="px-4 font-semibold active:scale-98 active:transition-all bg-primary text-primary-content py-2 rounded-full"
    type="submit"
  >
    Submit
  </button>
</form>
