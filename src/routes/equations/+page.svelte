<script lang="ts">
import { applyAction, enhance } from "$app/forms";
import { goto, invalidateAll } from "$app/navigation";
import ConformationDialog from "$components/ConformationDialog.svelte";
import { ArrowRight } from "$icons";
import { getToaster } from "$lib/toaster.svelte";
import type { Equation } from "$type/equations";
import { validateUuid } from "$utils/uuid";
import type { SubmitFunction } from "./$types";
import EquationCard from "./components/EquationCard.svelte";
import EquationSearch from "./components/EquationSearch.svelte";

let list = $state<Equation[]>([]);
let conformationDialog = $state<ConformationDialog>();
let equationToBeDeleted = $state<Equation>();
let deleteFormRef = $state<HTMLFormElement>();
const toaster = getToaster();

function onSearch(equations: Equation[]) {
  list = equations;
}

function onClickDelete(equation: Equation) {
  equationToBeDeleted = equation;
  conformationDialog?.openDialog();
}

function onDeleteResponse(answer: boolean) {
  if (answer) {
    deleteFormRef?.requestSubmit();
  }
}

const submitDeleteEquation: SubmitFunction = (
  { formData, formElement, cancel },
) => {
  const { id } = Object.fromEntries(formData.entries());
  const isValidUuid = validateUuid(id.toString());

  if (!isValidUuid) {
    toaster.error("Invalid equation id:uuid");
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
          `Equation deleted successfully`,
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

<a href="/equations/create">
  <button
    class="px-4 font-semibold active:scale-98 active:transition-all bg-primary text-primary-content py-2 rounded-full mb-4 flex gap-2"
    type="button"
  >
    Create equation
    <ArrowRight />
  </button>
</a>

<EquationSearch {onSearch} loadListOnLoad />
<ConformationDialog
  bind:this={conformationDialog}
  title="Delete Equation "
  content="Are you sure you want to delete equation with title "
  highlight={equationToBeDeleted?.title}
  onResponse={onDeleteResponse}
/>

<form
  bind:this={deleteFormRef}
  method="POST"
  action="?/delete"
  use:enhance={submitDeleteEquation}
  hidden
  class="absolute w-0 h-0 overflow-hidden"
>
  <input
    name="id"
    class="inline-flex h-8 w-full flex-1 items-center justify-center rounded-sm border border-solid border-neutral px-3 leading-none"
    value={equationToBeDeleted?.id}
    type="hidden"
    aria-disabled="true"
  />
</form>

<div class="grid lg:grid-cols-3 sm:grid-cols-1 md:grid-cols-2 gap-2">
  {#each list as equation}
    <EquationCard {equation} {onClickDelete} />
  {/each}
</div>
