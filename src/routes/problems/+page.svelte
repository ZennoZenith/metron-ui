<script lang="ts">
import { applyAction, enhance } from "$app/forms";
import { goto, invalidateAll } from "$app/navigation";
import ConformationDialog from "$components/ConformationDialog.svelte";
import { ProblemCard, ProblemSearch } from "$features/problems/components";
import { ArrowRight } from "$icons";
import { getToaster } from "$lib/toaster.svelte";
import type { ProblemShort, ProblemShortArray } from "$schemas/problems/self";
import { validateUuid } from "$schemas/uuid";
import type { SubmitFunction } from "./$types";

let list = $state<ProblemShortArray>([]);
let conformationDialog = $state<ConformationDialog>();
let problemToBeDeleted = $state<ProblemShort>();
let deleteFormRef = $state<HTMLFormElement>();
const toaster = getToaster();

function onSearch(problems: ProblemShortArray) {
  list = problems;
}

function onClickDelete(problem: ProblemShort) {
  problemToBeDeleted = problem;
  conformationDialog?.setOpenState();
}

function onDeleteResponse(answer: boolean) {
  if (answer) {
    deleteFormRef?.requestSubmit();
  }
}

const submitDeleteProblem: SubmitFunction = (
  { formData, formElement, cancel },
) => {
  const { id } = Object.fromEntries(formData.entries());
  const isValidUuid = validateUuid(id.toString());

  if (!isValidUuid) {
    toaster.error("Invalid problem id:uuid");
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
          `Problem deleted successfully`,
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

<a href="/problems/create">
  <button
    class="px-4 font-semibold active:scale-98 active:transition-all bg-primary text-primary-content py-2 rounded-full mb-4 flex gap-2"
    type="button"
  >
    Create problem
    <ArrowRight />
  </button>
</a>

<ProblemSearch {onSearch} loadListOnLoad />
<ConformationDialog
  bind:this={conformationDialog}
  title="Delete Problem "
  content="Are you sure you want to delete problem with title "
  highlight={problemToBeDeleted?.problemStatement}
  onResponse={onDeleteResponse}
/>

<form
  bind:this={deleteFormRef}
  method="POST"
  action="?/delete"
  use:enhance={submitDeleteProblem}
  hidden
  class="absolute w-0 h-0 overflow-hidden"
>
  <input
    name="id"
    class="inline-flex h-8 w-full flex-1 items-center justify-center rounded-sm border border-solid border-neutral px-3 leading-none"
    value={problemToBeDeleted?.id}
    type="hidden"
    aria-disabled="true"
  />
</form>

<div class="grid lg:grid-cols-3 sm:grid-cols-1 md:grid-cols-2 gap-2">
  {#each list as problem}
    <ProblemCard {problem} {onClickDelete} />
  {/each}
</div>
