<script lang="ts">
import { searchImage } from "$features/images/api/client";
import { getToaster } from "$lib/toaster.svelte";
import type { Image } from "$type/images";
import { onMount } from "svelte";

const toaster = getToaster();

type Props = { onSearch: (list: Image[]) => void; loadListOnLoad?: boolean };
let { onSearch, loadListOnLoad = false }: Props = $props();

let formRef = $state<HTMLFormElement>();
// let response = $state<Superposition<ValidationError, Tag[]>>();

async function onFormSubmit(
  event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement },
) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const formEntries = Object.fromEntries(formData.entries());

  const maybeImages = await searchImage(formEntries);

  if (maybeImages.isErr()) {
    const error = maybeImages.unwrapErr();
    console.error(error);
    toaster.error(error.message);
    return;
  }
  if (maybeImages.isOk()) {
    onSearch(maybeImages.unwrap());
  }
}

onMount(() => {
  if (loadListOnLoad) {
    formRef?.requestSubmit();
  }
});
</script>

<div class="">
  <form
    bind:this={formRef}
    class="mb-4 flex items-center gap-2 h-10"
    onsubmit={onFormSubmit}
  >
    <input
      class="inline-flex h-10 w-full flex-1 items-center justify-center rounded border border-solid border-accent px-3 leading-none"
      id="name"
      name="search"
      placeholder="Search image"
    />
    <button
      type="submit"
      class="bg-secondary text-secondary-content px-4 h-full rounded"
    >
      Search
    </button>
  </form>
</div>
