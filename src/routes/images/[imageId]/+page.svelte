<script lang="ts">
import { goto } from "$app/navigation";
import ConformationDialog from "$components/ConformationDialog.svelte";
import { ImageApiClient } from "$features/images/api";
import Image from "$features/images/components/Image.svelte";
import type { UpdateSchema } from "$features/images/schemas/update";
import { Edit, Trash } from "$icons";
import { getToaster } from "$lib/toaster.svelte";
import { setEmptyStringAsNullish } from "$utils/helpers";
import type { PageData } from "./$types";

const toaster = getToaster();
const imageClient = new ImageApiClient();

let deleteConformationDialog = $state<ConformationDialog>();

const { data }: { data: PageData } = $props();
let edit = $state(data.edit);
const defaultImage = data.image;

async function onDeleteResponse(answer: boolean) {
  if (!answer) return;

  const response = await imageClient.deleteById(defaultImage.id);

  if (response.isErr()) {
    const err = response.unwrapErr();
    toaster.error(err?.message ?? "");
    console.error(err);
    return;
  }

  toaster.success(
    `image deleted successfully redirecting to /images in 5sec`,
  );
  setTimeout(() => goto("/images"), 5000);
}

async function onSubmit(data: UpdateSchema): Promise<void> {
  const result = await imageClient.update({
    id: data.id,
    title: data.title,
    imageType: data.imageType,
    description: setEmptyStringAsNullish(data.description),
    tags: data.tags,
    image: data.image,
  });

  if (result.err) {
    toaster.error(
      result.unwrapErr().message ?? "Internal Server Error",
    );
    const errorObj = result.unwrapErr().error;
    console.error(errorObj);
    // setFailureResponse(errorObj);
    return;
  }

  if (result.isOk()) {
    edit = false;
    toaster.success("Image Updated reloading page in 5 seconds");
    setTimeout(
      () => window.location.replace(`/images/${defaultImage.id}`),
      5000,
    );
  }
}
</script>

<ConformationDialog
  bind:this={deleteConformationDialog}
  title="Delete Image "
  content="Are you sure you want to delete image"
  onResponse={onDeleteResponse}
/>

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

<Image {onSubmit} {defaultImage} disabled={!edit} />
