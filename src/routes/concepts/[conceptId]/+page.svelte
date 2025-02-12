<script lang="ts">
import { goto, invalidateAll, replaceState } from "$app/navigation";
import { page } from "$app/state";
import ConformationDialog from "$components/ConformationDialog.svelte";
import { ConceptApiClient } from "$features/concepts/api";
import Concept from "$features/concepts/components/Concept.svelte";
import { Edit, Trash } from "$icons";
import { Log } from "$lib/logger";
import { getToaster } from "$lib/toaster.svelte";
import type { InternalVariables } from "$schemas/internal-variable.svelte";
import { setEmptyStringAsNullish } from "$utils/helpers";
import type { PageData } from "./$types";

const toaster = getToaster();
const conceptClient = new ConceptApiClient();

let deleteConformationDialog = $state<ConformationDialog>();

const { data }: { data: PageData } = $props();
const { concept: defaultConcept } = data;
let edit = $state(data.edit);

async function onDeleteResponse(answer: boolean) {
  if (!answer) return;

  const response = await conceptClient.deleteById(defaultConcept.id);

  if (response.isErr()) {
    const err = response.unwrapErr();
    toaster.error(err?.message ?? "");
    Log.error(err);
    return;
  }

  toaster.success(
    `Concept deleted successfully redirecting to /concepts in 5sec`,
  );
  setTimeout(() => goto("/concepts"), 5000);
}

async function onSubmit(
  id: string,
  title: string,
  description: string,
  content: string,
  tags: string,
  equations: string,
  images: string,
  concepts: string,
  internalVariables: InternalVariables,
): Promise<void> {
  const variables = internalVariables.toVariables();

  const result = await conceptClient.update({
    id,
    title,
    description: setEmptyStringAsNullish(description),
    content,
    tags,
    equations,
    images,
    concepts,
    variables,
  });

  if (result.err) {
    toaster.error(
      result.unwrapErr().message ?? "Internal Server Error",
    );
    const errorObj = result.unwrapErr().error;
    Log.error(errorObj);
    // setFailureResponse(errorObj);
    return;
  }

  if (result.isOk()) {
    edit = false;
    toaster.success("Concept Updated");
    invalidateAll();
    replaceState(
      page.url.toString().replaceAll("edit=true", ""),
      {},
    );
  }
}
</script>

<ConformationDialog
  bind:this={deleteConformationDialog}
  title="Delete Concept "
  content="Are you sure you want to delete concept"
  onResponse={onDeleteResponse}
/>

<div class="flex justify-between">
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

<Concept {onSubmit} {defaultConcept} disabled={!edit} />
