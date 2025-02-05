<script lang="ts">
import { goto } from "$app/navigation";
import ConformationDialog from "$components/ConformationDialog.svelte";
import { EquationApiClient } from "$features/equations/api";
import { EquationCard, EquationSearch } from "$features/equations/components";
import { ArrowRight } from "$icons";
import { getToaster } from "$lib/toaster.svelte";
import type { Equation } from "$type/equations";

let list = $state<Equation[]>([]);
let deleteConformationDialog = $state<ConformationDialog>();
let equationToBeDeleted = $state<Equation>();

const toaster = getToaster();
const equationClient = new EquationApiClient();

function onSearch(equations: Equation[]) {
  list = equations;
}

function onClickDelete(equation: Equation) {
  equationToBeDeleted = equation;
  deleteConformationDialog?.setOpenState();
}

async function onDeleteResponse(answer: boolean) {
  if (!answer) {
    equationToBeDeleted = undefined;
    return;
  }

  const response = await equationClient.deleteById(
    equationToBeDeleted?.id,
  );

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
</script>

<a href="/equations/create">
  <button
    class="px-4 font-semibold active:scale-98 active:transition-all bg-primary text-primary-content py-2 rounded-full mb-4 flex gap-2"
    type="button"
  >
    Create equation
    <ArrowRight />
  </button>
</a>

<ConformationDialog
  bind:this={deleteConformationDialog}
  title="Delete Equation "
  content="Are you sure you want to delete equation with title "
  highlight={equationToBeDeleted?.title}
  onResponse={onDeleteResponse}
/>

<EquationSearch {onSearch} loadListOnLoad />

<div class="grid lg:grid-cols-3 sm:grid-cols-1 md:grid-cols-2 gap-2">
  {#each list as equation}
    <EquationCard {equation} {onClickDelete} />
  {/each}
</div>
