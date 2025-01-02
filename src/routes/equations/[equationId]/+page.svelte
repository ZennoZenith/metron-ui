<script lang="ts">
import { applyAction, enhance } from "$app/forms";
import { goto } from "$app/navigation";
import ConformationDialog from "$components/ConformationDialog.svelte";
import TagSearch from "$components/TagSearch.svelte";
import {
  type UpdateIssues,
  validateUpdateSchema,
} from "$features/equations/schemas/update";
import { Edit, Trash } from "$icons";
import type { ErrorObject } from "$lib/error";
import { getToaster } from "$lib/toaster.svelte";
import { validateUuid } from "$schemas/uuid";
import type { SubmitFunction } from "../$types";
import type { PageData } from "./$types";

const toaster = getToaster();

let deleteFormRef = $state<HTMLFormElement>();
let deleteConformationDialog = $state<ConformationDialog>();
let failureResopnse = $state<UpdateIssues & { message?: string }>();

const { data }: { data: PageData } = $props();
const { equation } = data;
let edit = $state(data.edit);

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

const deleteEquation: SubmitFunction = (
  { formData, formElement, cancel },
) => {
  const { id } = Object.fromEntries(formData.entries());
  const isValidUuid = validateUuid(id.toString());

  if (!isValidUuid) {
    toaster.error("Invalid equation id:uuid");
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
          `Equation deleted successfully redirecting to /equations in 5sec`,
        );
        setTimeout(() => goto("/equations"), 5000);
        break;
      case "failure":
        toaster.error(result.data?.message ?? "");
        break;
    }
    await applyAction(result);
  };
};

const updateEquation: SubmitFunction = (
  { formData, cancel },
) => {
  if (formData.get("description")?.toString().trim() === "") {
    formData.delete("description");
  }
  if (formData.get("tags")?.toString().trim() === "") {
    formData.delete("tags");
  }
  const formEntries = Object.fromEntries(formData.entries());

  let parsed = validateUpdateSchema(formEntries);

  if (parsed.isErr()) {
    setFailureResponse(parsed.err?.error);
    toaster.error("Invalid form data");
    console.error(parsed.unwrapErr().error);
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
        toaster.success("Equation saved");
        setTimeout(
          () => window.location.replace(`/equations/${equation.id}`),
          5000,
        );
        break;
      case "failure":
        setFailureResponse(result.data);
        toaster.error(result.data?.message ?? "");
        break;
    }

    await applyAction(result);
  };
};
</script>

<ConformationDialog
  bind:this={deleteConformationDialog}
  title="Delete Equation "
  content="Are you sure you want to delete equation"
  onResponse={onDeleteResponse}
/>
<form
  bind:this={deleteFormRef}
  method="POST"
  action="/equations?/delete"
  use:enhance={deleteEquation}
  hidden
  class="absolute w-0 h-0 overflow-hidden"
>
  <input
    name="id"
    class="inline-flex h-8 w-full flex-1 items-center justify-center rounded-sm border border-solid border-neutral px-3 leading-none"
    value={equation.id}
    type="hidden"
    aria-disabled="true"
  />
</form>

<div class="flex justify-between mx-auto max-w-(--breakpoint-xl)">
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
  id="form"
  method="POST"
  action="/equations?/update"
  use:enhance={updateEquation}
  class="mx-auto max-w-(--breakpoint-xl) grid sm:grid-cols-1 xl:grid-cols-2 gap-4"
>
  <input type="hidden" name="id" value={equation.id}>
  <div class="px-2 py-4 flex flex-col gap-6">
    <label class="">
      <div class="">
        Title <span class="text-error" aria-label="required"> * </span>
      </div>
      <textarea
        id="title"
        class="w-full text-xl h-12 min-h-12 p-2 rounded border border-solid border-base-content"
        placeholder=""
        name="title"
        required
        value={equation.title}
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
        value={equation.description}
        disabled={!edit}
      ></textarea>
      {#if failureResopnse?.description}
        <div class="text-error">
          {failureResopnse.description[0]}
        </div>
      {/if}
    </label>

    {#if edit}
      <TagSearch defaultSelectedTags={equation.tags} />
      {#if failureResopnse?.tags}
        <div class="text-error">
          {failureResopnse.tags[0]}
        </div>
      {/if}
    {:else}
      <div
        class="flex p-2 gap-2 flex-wrap border rounded border-solid border-base-content min-h-fit items-center"
      >
        {#each equation.tags as tag}
          <span
            class="bg-info text-info-content font-semibold px-3 rounded-full flex items-center gap-1"
          >
            {tag.title}
          </span>
        {/each}
      </div>
    {/if}
  </div>
  <div class="px-2 py-4 flex flex-col gap-6">
    <label class="">
      <div class="label">
        Content <span class="text-error" aria-label="required"> * </span>
      </div>
      <textarea
        id="content"
        class="w-full text-xl min-h-12 h-96 p-2 rounded border border-solid border-base-content"
        placeholder=""
        name="content"
        value={equation.content}
        required
        disabled={!edit}
      ></textarea>
      {#if failureResopnse?.content}
        <div class="text-error">
          {failureResopnse.content[0]}
        </div>
      {/if}
    </label>
  </div>

  <button
    class="px-4 font-semibold active:scale-98 active:transition-all bg-primary text-primary-content py-2 rounded-full"
    type="submit"
  >
    Submit
  </button>
</form>
