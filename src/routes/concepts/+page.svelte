<script lang="ts">
import type { ConceptShort, ConceptShortArray } from "$api/schemas/concepts";
import { goto } from "$app/navigation";
import ConformationDialog from "$components/ConformationDialog.svelte";
import { ConceptApiClient } from "$features/concepts/api";
import { ConceptCard, ConceptSearch } from "$features/concepts/components";
import { ArrowRight } from "$icons";
import { getToaster } from "$lib/toaster.svelte";

let list = $state<ConceptShortArray>([]);
let deleteConformationDialog = $state<ConformationDialog>();
let conceptToBeDeleted = $state<ConceptShort>();

const toaster = getToaster();
const conceptClient = new ConceptApiClient();

function onSearch(concepts: ConceptShortArray) {
  list = concepts;
}

function onClickDelete(concept: ConceptShort) {
  conceptToBeDeleted = concept;
  deleteConformationDialog?.setOpenState();
}

async function onDeleteResponse(answer: boolean) {
  if (!answer) {
    conceptToBeDeleted = undefined;
    return;
  }

  const response = await conceptClient.deleteById(
    conceptToBeDeleted?.id,
  );

  if (response.isErr()) {
    const err = response.unwrapErr();
    toaster.error(err?.message ?? "");
    return;
  }

  toaster.success(
    `Concept deleted successfully redirecting to /concepts in 5sec`,
  );
  setTimeout(() => goto("/concepts"), 5000);
}
</script>

<a href="/concepts/create">
  <button
    class="px-4 font-semibold active:scale-98 active:transition-all bg-primary text-primary-content py-2 rounded-full mb-4 flex gap-2"
    type="button"
  >
    Create concept
    <ArrowRight />
  </button>
</a>

<ConformationDialog
  bind:this={deleteConformationDialog}
  title="Delete Concept "
  content="Are you sure you want to delete concept with title "
  highlight={conceptToBeDeleted?.title}
  onResponse={onDeleteResponse}
/>

<ConceptSearch {onSearch} loadListOnLoad />

<div class="grid lg:grid-cols-3 sm:grid-cols-1 md:grid-cols-2 gap-2">
  {#each list as concept}
    <ConceptCard {concept} {onClickDelete} />
  {:else}
    <p>No concept found</p>
  {/each}
</div>
