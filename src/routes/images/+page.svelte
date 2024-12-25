<script lang="ts">
import { applyAction, enhance } from "$app/forms";
import { goto, invalidateAll } from "$app/navigation";
import ConformationDialog from "$components/ConformationDialog.svelte";
import { ArrowRight } from "$icons";
import { getToaster } from "$lib/toaster.svelte";
import { validateUuid } from "$schemas/uuid";
import type { Image } from "$type/images";
import type { SubmitFunction } from "./$types";
import ImageCard from "./components/ImageCard.svelte";
import ImageSearch from "./components/ImageSearch.svelte";

let list = $state<Image[]>([]);
let conformationDialog = $state<ConformationDialog>();
let imageToBeDeleted = $state<Image>();
let deleteFormRef = $state<HTMLFormElement>();
const toaster = getToaster();

function onSearch(images: Image[]) {
  list = images;
}

function onClickDelete(image: Image) {
  imageToBeDeleted = image;
  conformationDialog?.openDialog();
}

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

<a href="/images/create">
  <button
    class="px-4 font-semibold active:scale-98 active:transition-all bg-primary text-primary-content py-2 rounded-full mb-4 flex gap-2"
    type="button"
  >
    Create image
    <ArrowRight />
  </button>
</a>

<ImageSearch {onSearch} loadListOnLoad />
<ConformationDialog
  bind:this={conformationDialog}
  title="Delete Image "
  content="Are you sure you want to delete image with title "
  highlight={imageToBeDeleted?.title}
  onResponse={onDeleteResponse}
/>

<form
  bind:this={deleteFormRef}
  method="POST"
  action="?/delete"
  use:enhance={submitDeleteImage}
  hidden
  class="absolute w-0 h-0 overflow-hidden"
>
  <input
    name="id"
    class="inline-flex h-8 w-full flex-1 items-center justify-center rounded-sm border border-solid border-neutral px-3 leading-none"
    value={imageToBeDeleted?.id}
    type="hidden"
    aria-disabled="true"
  />
</form>

<div class="grid lg:grid-cols-3 sm:grid-cols-1 md:grid-cols-2 gap-2">
  {#each list as image}
    <ImageCard {image} {onClickDelete} />
  {/each}
</div>
