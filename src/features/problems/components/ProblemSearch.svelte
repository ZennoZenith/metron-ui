<script lang="ts">
import { Log } from "$lib/logger";
import { getToaster } from "$lib/toaster.svelte";
import type { ProblemShortArray } from "$schemas/problems/self";
import { onMount } from "svelte";
import { ProblemApiClient } from "../api";

const toaster = getToaster();
const problemClient = new ProblemApiClient();

type Props = {
  onSearch: (list: ProblemShortArray) => void;
  loadListOnLoad?: boolean;
};
let { onSearch, loadListOnLoad = false }: Props = $props();

let formRef = $state<HTMLFormElement>();

async function onFormSubmit(
  event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement },
) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const formEntries = Object.fromEntries(formData.entries());

  const maybeProblems = await problemClient.searchShortsByQueryTitle(
    formEntries,
  );

  if (maybeProblems.isErr()) {
    const error = maybeProblems.unwrapErr();
    Log.error(error);
    toaster.error(error.message);
    return;
  }
  if (maybeProblems.isOk()) {
    onSearch(maybeProblems.unwrap());
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
      placeholder="Search problems"
    />
    <button
      type="submit"
      class="bg-secondary text-secondary-content px-4 h-full rounded"
    >
      Search
    </button>
  </form>
</div>
