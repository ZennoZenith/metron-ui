<script lang="ts">
import { goto, invalidateAll, replaceState } from "$app/navigation";
import { page } from "$app/state";
import ConformationDialog from "$components/ConformationDialog.svelte";
import { EquationApiClient } from "$features/equations/api";
import Equation from "$features/equations/components/Equation.svelte";
import { Edit, Trash } from "$icons";
import { getToaster } from "$lib/toaster.svelte";
import { setEmptyStringAsNullish } from "$utils/helpers";
import type { PageData } from "./$types";

const toaster = getToaster();
const equationClient = new EquationApiClient();

let deleteConformationDialog = $state<ConformationDialog>();

const { data }: { data: PageData } = $props();
const { equation: defaultEquation } = data;
let edit = $state(data.edit);

async function onDeleteResponse(answer: boolean) {
  if (!answer) return;

  const response = await equationClient.deleteById(defaultEquation.id);

  if (response.isErr()) {
    const err = response.unwrapErr();
    toaster.error(err?.message ?? "");
    console.error(err);
    return;
  }

  toaster.success(
    `Equation deleted successfully redirecting to /equations in 5sec`,
  );
  setTimeout(() => goto("/equations"), 5000);
}

async function onSubmit(
  id: string,
  title: string,
  description: string,
  content: string,
  tags: string,
): Promise<void> {
  const result = await equationClient.update({
    id,
    title,
    description: setEmptyStringAsNullish(description),
    content,
    tags,
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
    toaster.success("Equation Updated");
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
  title="Delete Equation "
  content="Are you sure you want to delete equation"
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

<Equation {onSubmit} {defaultEquation} disabled={!edit} />
