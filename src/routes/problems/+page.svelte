<script lang="ts">
import { applyAction, enhance } from "$app/forms";
import { goto, invalidateAll } from "$app/navigation";
import ConformationDialog from "$components/ConformationDialog.svelte";
import { ConceptCard, ConceptSearch } from "$features/concepts/components";
import { ArrowRight } from "$icons";
import { getToaster } from "$lib/toaster.svelte";
import type { ConceptShort, ConceptShortArray } from "$schemas/concepts/self";
import { validateUuid } from "$schemas/uuid";
import type { SubmitFunction } from "./$types";

let list = $state<ConceptShortArray>([]);
let conformationDialog = $state<ConformationDialog>();
let conceptToBeDeleted = $state<ConceptShort>();
let deleteFormRef = $state<HTMLFormElement>();
const toaster = getToaster();

function onSearch(concepts: ConceptShortArray) {
  list = concepts;
}

function onClickDelete(concept: ConceptShort) {
  conceptToBeDeleted = concept;
  conformationDialog?.setOpenState();
}

function onDeleteResponse(answer: boolean) {
  if (answer) {
    deleteFormRef?.requestSubmit();
  }
}

const submitDeleteConcept: SubmitFunction = (
  { formData, formElement, cancel },
) => {
  const { id } = Object.fromEntries(formData.entries());
  const isValidUuid = validateUuid(id.toString());

  if (!isValidUuid) {
    toaster.error("Invalid concept id:uuid");
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
          `Concept deleted successfully`,
        );
        break;
      case "failure":
        toaster.error(result.data?.message ?? "");
        break;
    }
    await applyAction(result);
    await invalidateAll();
  };
};
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

<ConceptSearch {onSearch} loadListOnLoad />
<ConformationDialog
  bind:this={conformationDialog}
  title="Delete Concept "
  content="Are you sure you want to delete concept with title "
  highlight={conceptToBeDeleted?.title}
  onResponse={onDeleteResponse}
/>

<form
  bind:this={deleteFormRef}
  method="POST"
  action="?/delete"
  use:enhance={submitDeleteConcept}
  hidden
  class="absolute w-0 h-0 overflow-hidden"
>
  <input
    name="id"
    class="inline-flex h-8 w-full flex-1 items-center justify-center rounded-sm border border-solid border-neutral px-3 leading-none"
    value={conceptToBeDeleted?.id}
    type="hidden"
    aria-disabled="true"
  />
</form>

<div class="grid lg:grid-cols-3 sm:grid-cols-1 md:grid-cols-2 gap-2">
  {#each list as concept}
    <ConceptCard {concept} {onClickDelete} />
  {/each}
</div>
