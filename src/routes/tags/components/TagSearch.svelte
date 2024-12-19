<script lang="ts">
import { searchTag } from "$features/tags/api/client";
import type { Tag } from "$type/tags";
import { onMount } from "svelte";

type Props = { onSearch: (list: Tag[]) => void; loadListOnLoad?: boolean };
let { onSearch, loadListOnLoad = false }: Props = $props();

let formRef = $state<HTMLFormElement>();
// let response = $state<Superposition<ValidationError, Tag[]>>();

async function onFormSubmit(
  event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement },
) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const formEntries = Object.fromEntries(formData.entries());

  const maybeTags = await searchTag(formEntries);

  if (maybeTags.err) {
    console.error(maybeTags.err);
  }
  if (maybeTags.isOk()) {
    onSearch(maybeTags.unwrap());
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
      placeholder="Tag title"
      value=""
    />
    <button
      type="submit"
      class="bg-secondary text-secondary-content px-4 h-full rounded"
    >
      Search
    </button>
  </form>
</div>
