<script lang="ts">
import { Log } from "$lib/logger";
import { getToaster } from "$lib/toaster.svelte";
import type { Tag } from "$type/tags";
import { onMount } from "svelte";
import { TagApiClient } from "../api";

const toaster = getToaster();
const tagClient = new TagApiClient();

type Props = { onSearch: (list: Tag[]) => void; loadListOnLoad?: boolean };
let { onSearch, loadListOnLoad = false }: Props = $props();

let search = $state("");

async function onFormSubmit() {
  const maybeTags = await tagClient.searchByQueryTitle({ search });

  if (maybeTags.err) {
    Log.info("Tag saved");
    toaster.success("Tag saved");
    return;
  }
  if (maybeTags.isOk()) {
    onSearch(maybeTags.unwrap());
  }
}

onMount(() => {
  if (loadListOnLoad) {
    onFormSubmit();
  }
});
</script>

<div class="">
  <form
    class="mb-4 flex items-center gap-2 h-10"
    onsubmit={event => {
      event.preventDefault();
      onFormSubmit();
    }}
  >
    <input
      class="inline-flex h-10 w-full flex-1 items-center justify-center rounded border border-solid border-accent px-3 leading-none"
      id="name"
      name="search"
      placeholder="Tag title"
      bind:value={search}
    />
    <button
      type="submit"
      class="bg-secondary text-secondary-content px-4 h-full rounded"
    >
      Search
    </button>
  </form>
</div>
