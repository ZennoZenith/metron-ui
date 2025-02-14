<script lang="ts">
import { Log } from "$lib/logger";
import { getToaster } from "$lib/toaster.svelte";
import type { Equation } from "$type/equations";
import { onMount } from "svelte";
import { EquationApiClient } from "../api";

const toaster = getToaster();
const equationClient = new EquationApiClient();

type Props = { onSearch: (list: Equation[]) => void; loadListOnLoad?: boolean };
let { onSearch, loadListOnLoad = false }: Props = $props();

let formRef = $state<HTMLFormElement>();
// let response = $state<Superposition<ValidationError, Tag[]>>();

async function onFormSubmit(
  event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement },
) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const formEntries = Object.fromEntries(formData.entries());

  const maybeEquations = await equationClient.searchByQueryTitle(formEntries);

  if (maybeEquations.isErr()) {
    const error = maybeEquations.unwrapErr();
    Log.error(error);
    toaster.error(error.message);
    return;
  }
  if (maybeEquations.isOk()) {
    onSearch(maybeEquations.unwrap());
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
      placeholder="Search equations"
    />
    <button
      type="submit"
      class="bg-secondary text-secondary-content px-4 h-full rounded"
    >
      Search
    </button>
  </form>
</div>
