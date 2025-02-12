<script lang="ts">
import { goto } from "$app/navigation";
import ConformationDialog from "$components/ConformationDialog.svelte";
import { ImageApiClient } from "$features/images/api";
import { ImageCard, ImageSearch } from "$features/images/components";
import { ArrowRight } from "$icons";
import { Log } from "$lib/logger";
import { getToaster } from "$lib/toaster.svelte";
import type { Image } from "$type/images";

let list = $state<Image[]>([]);
let deleteConformationDialog = $state<ConformationDialog>();
let imageToBeDeleted = $state<Image>();
const toaster = getToaster();
const imageClient = new ImageApiClient();

function onSearch(images: Image[]) {
  list = images;
}

function onClickDelete(image: Image) {
  imageToBeDeleted = image;
  deleteConformationDialog?.setOpenState();
}

async function onDeleteResponse(answer: boolean) {
  if (!answer) {
    imageToBeDeleted = undefined;
    return;
  }

  const response = await imageClient.deleteById(
    imageToBeDeleted?.id,
  );

  if (response.isErr()) {
    const err = response.unwrapErr();
    toaster.error(err?.message ?? "");
    Log.error(err);
    return;
  }

  toaster.success(
    `Image deleted successfully redirecting to /images in 5sec`,
  );
  setTimeout(() => goto("/images"), 5000);
}
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

<ConformationDialog
  bind:this={deleteConformationDialog}
  title="Delete Image "
  content="Are you sure you want to delete image with title "
  highlight={imageToBeDeleted?.title}
  onResponse={onDeleteResponse}
/>

<ImageSearch {onSearch} loadListOnLoad />

<div class="grid lg:grid-cols-3 sm:grid-cols-1 md:grid-cols-2 gap-2">
  {#each list as image}
    <ImageCard {image} {onClickDelete} />
  {/each}
</div>
