<script lang="ts">
import { applyAction, enhance } from "$app/forms";
import { goto, invalidateAll } from "$app/navigation";
import { default as DeleteTagDialog } from "$components/ConformationDialog.svelte";
import type { CreateIssues } from "$features/equations/schemas/create";
import {
  CreateTagDialog,
  TagCard,
  TagSearch,
  UpdateTagDialog,
} from "$features/tags/components";
import { validateCreateSchema } from "$features/tags/schemas/create";
import {
  type UpdateIssues,
  validateUpdateSchema,
} from "$features/tags/schemas/update";
import type { ErrorObject } from "$lib/error";
import { isErr } from "$lib/superposition";
import { getToaster } from "$lib/toaster.svelte";
import { validateUuid } from "$schemas/uuid";
import type { Tag } from "$type/tags";
import type { SubmitFunction } from "./$types";

let list = $state<Tag[]>([]);

const toaster = getToaster();

const onSearch = (l: Tag[]) => {
  list = l;
};

let updateDialogRef = $state<UpdateTagDialog>();
let deleteDialogRef = $state<DeleteTagDialog>();
let createDialogRef = $state<CreateTagDialog>();

let deleteFormRef = $state<HTMLFormElement>();
let updateFormRef = $state<HTMLFormElement>();
let createFormRef = $state<HTMLFormElement>();

let tagToBeDeleted = $state<Tag>();
let tagToBeUpdated = $state<Tag>();
let updateFailureResopnse = $state<UpdateIssues & { message?: string }>({});
let updatedTitle = $state("");
let createdTitle = $state("");
let createFailureResopnse = $state<CreateIssues & { message?: string }>({});

function setUpdateFailureResponse(error?: ErrorObject) {
  updateFailureResopnse = {
    title: error?.type === "validation-error"
      ? error.extra?.title as [string, ...string[]]
      : undefined,
    message: error?.message,
  };
}

function setCreateFailureResponse(error?: ErrorObject) {
  createFailureResopnse = {
    title: error?.type === "validation-error"
      ? error.extra?.title as [string, ...string[]]
      : undefined,
    message: error?.message,
  };
}

function onClickDelete(tag: Tag) {
  tagToBeDeleted = tag;
  deleteDialogRef?.setOpenState();
}

function onClickUpdate(tag: Tag) {
  tagToBeUpdated = tag;
  updateDialogRef?.setOpenState();
}

function onClickCreate() {
  createDialogRef?.setOpenState();
}

function onCreateResponse(answer: boolean, newTitle?: string) {
  if (answer) {
    createdTitle = newTitle ?? "";
    createFormRef?.requestSubmit();
  } else {
    createdTitle = "";
  }
}

function onUpdateResponse(answer: boolean, newTitle?: string) {
  if (answer) {
    updatedTitle = newTitle ?? "";
    updateFormRef?.requestSubmit();
  } else {
    updatedTitle = "";
  }
}

function onDeleteResponse(answer: boolean) {
  if (answer) {
    deleteFormRef?.requestSubmit();
  }
}

const submitCreateTag: SubmitFunction = (
  { formData, formElement, cancel },
) => {
  formData.delete("title");
  formData.set("title", createdTitle);
  const formEntries = Object.fromEntries(formData.entries());
  let parsed = validateCreateSchema(formEntries);

  if (parsed.isErr()) {
    setCreateFailureResponse(parsed.err?.error);
    toaster.error("Invalid form data");
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
          `Tag created with name ${result.data?.title ?? ""}`,
        );
        createDialogRef?.setOpenState(false);
        break;
      case "failure":
        setCreateFailureResponse(result.data);
        toaster.error(result.data?.message ?? "");
        break;
    }
    await applyAction(result);
    await invalidateAll();
  };
};

const submitUpdateTag: SubmitFunction = (
  { formData, formElement, cancel },
) => {
  formData.delete("title");
  formData.set("title", updatedTitle);
  const formEntries = Object.fromEntries(formData.entries());
  let parsed = validateUpdateSchema(formEntries);

  if (isErr(parsed)) {
    setUpdateFailureResponse(parsed.unwrapErr().error);
    toaster.error("Invalid form data");
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
        updateDialogRef?.setOpenState(false);
        toaster.success(
          "Tag updated",
        );
        break;
      case "failure":
        setUpdateFailureResponse(result.data);
        toaster.error(result.data?.message ?? "");
        break;
    }
    // await update();
    await applyAction(result);
    await invalidateAll();
  };
};

const submitDeleteTag: SubmitFunction = (
  { formData, formElement, cancel },
) => {
  const { id } = Object.fromEntries(formData.entries());
  const isValidUuid = validateUuid(id.toString());

  if (!isValidUuid) {
    toaster.error("Invalid image id:uuid");
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
          `Image deleted successfully`,
        );
        break;
      case "failure":
        toaster.error(result.data?.message ?? "");
        break;
    }
    // await update();
    await applyAction(result);
    await invalidateAll();
  };
};
</script>

<form
  bind:this={deleteFormRef}
  method="POST"
  action="?/delete"
  use:enhance={submitDeleteTag}
  hidden
  class="absolute w-0 h-0 overflow-hidden"
>
  <input
    name="id"
    class="inline-flex h-8 w-full flex-1 items-center justify-center rounded-sm border border-solid border-neutral px-3 leading-none"
    value={tagToBeDeleted?.id}
    type="hidden"
    aria-disabled="true"
  />
</form>

<form
  bind:this={updateFormRef}
  method="POST"
  action="?/update"
  use:enhance={submitUpdateTag}
  hidden
  class="absolute w-0 h-0 overflow-hidden"
>
  <input
    name="id"
    value={tagToBeUpdated?.id}
    type="hidden"
    aria-disabled="true"
  />
  <!-- title set in enhanced code -->
</form>

<form
  bind:this={createFormRef}
  method="POST"
  action="?/create"
  use:enhance={submitCreateTag}
  hidden
  class="absolute w-0 h-0 overflow-hidden"
>
  <!-- title set in enhanced code -->
</form>

<DeleteTagDialog
  bind:this={deleteDialogRef}
  title="Delete Image "
  content="This action cannot be undone. This will permanently delete the tag: "
  highlight={tagToBeDeleted?.title}
  onResponse={onDeleteResponse}
/>
<UpdateTagDialog
  bind:this={updateDialogRef}
  tag={tagToBeUpdated}
  onResponse={onUpdateResponse}
  failureResopnse={updateFailureResopnse}
  closeOnYes={false}
/>
<CreateTagDialog
  bind:this={createDialogRef}
  failureResopnse={createFailureResopnse}
  closeOnYes={false}
  onResponse={onCreateResponse}
/>
<div class="grid grid-cols-1 p-2 gap-4">
  <button
    class="bg-primary text-primary-content p-2 rounded-full active:scale-98 active:transition-all hover:bg-primary/95"
    onclick={onClickCreate}
  >
    Create Tag
  </button>

  <TagSearch {onSearch} loadListOnLoad />
  <div class="grid lg:grid-cols-3 sm:grid-cols-1 md:grid-cols-2 gap-2">
    {#each list as tag}
      <TagCard {tag} {onClickDelete} {onClickUpdate} />
    {:else}
      <div class="flex border border-secondary gap-1 rounded p-2">
        No tag found
      </div>
    {/each}
  </div>
</div>
