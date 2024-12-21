<script lang="ts">
import { applyAction, enhance } from "$app/forms";
import { goto } from "$app/navigation";
import ConformationDialog from "$components/ConformationDialog.svelte";
import { IMAGE_BASE_ROUTE } from "$constants";
import { Edit, Trash } from "$icons";
import { getToaster } from "$lib/toaster.svelte";
import { validateUuid } from "$utils/uuid";
import type { SubmitFunction } from "../$types";
import type { PageData } from "./$types";

const toaster = getToaster();
let deleteFormRef = $state<HTMLFormElement>();
let conformationDialog = $state<ConformationDialog>();

let { data: image }: { data: PageData } = $props();

function onDeleteResponse(answer: boolean) {
  if (answer) {
    deleteFormRef?.requestSubmit();
  }
}

const submitDeleteImage: SubmitFunction = (
  { formData, formElement, cancel },
) => {
  const { id } = Object.fromEntries(formData.entries());
  const isValidUuid = validateUuid(id.toString());

  if (!isValidUuid) {
    toaster.error("Invalid tag id:uuid");
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
          `Image deleted successfully redirecting to /images in 5sec`,
        );
        setTimeout(() => goto("/images"), 5000);
        break;
      case "failure":
        toaster.error(result.data?.message ?? "");
        break;
    }
    await applyAction(result);
  };
};
</script>

<ConformationDialog
  bind:this={conformationDialog}
  title="Delete Image "
  content="Are you sure you want to delete image"
  onResponse={onDeleteResponse}
/>
<form
  bind:this={deleteFormRef}
  method="POST"
  action="/images/?/delete"
  use:enhance={submitDeleteImage}
  hidden
  class="absolute w-0 h-0 overflow-hidden"
>
  <input
    name="id"
    class="inline-flex h-8 w-full flex-1 items-center justify-center rounded-sm border border-solid border-neutral px-3 leading-none"
    value={image.id}
    type="hidden"
    aria-disabled="true"
  />
</form>

<div
  class="rounded-xl bg-base-200 flex flex-col mx-auto p-2"
  style="width: min(100%, 50rem)"
>
  <div class="">
    <img
      class="w-full mx-auto"
      src={image.fileLocation.replace("file://", IMAGE_BASE_ROUTE)}
      alt=""
    >
  </div>
  <div class="p-2 bg-base-300 rounded-b-xl flex-1 flex flex-col">
    <div class="font-bold text-xl mb-1 block flex items-center gap-2">
      {image.title}
    </div>
    <div class="flex gap-2">
      {#each image.tags as tag}
        <div class="bg-info text-info-content font-semibold rounded-full px-4">
          {tag.title}
        </div>
      {/each}
    </div>
    <div class="flex-1">{image.description}</div>
    <div>{new Date(image.createdAt).toLocaleString()}</div>
    <div class="flex justify-between">
      <button
        class="flex gap-2 items-center bg-warning text-warning-content rounded-full px-4 py-1"
      >
        Edit <Edit />
      </button>
      <button
        class="flex gap-2 items-center bg-error text-error-content rounded-full px-4 py-1"
        onclick={() => conformationDialog?.openDialog()}
      >
        Delete <Trash />
      </button>
    </div>
  </div>
</div>
