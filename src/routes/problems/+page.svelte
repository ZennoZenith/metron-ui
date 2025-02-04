<script lang="ts">
import { goto } from "$app/navigation";
import ConformationDialog from "$components/ConformationDialog.svelte";
import { ProblemApiClient } from "$features/problems/api";
import { ProblemCard, ProblemSearch } from "$features/problems/components";
import { ArrowRight } from "$icons";
import { getToaster } from "$lib/toaster.svelte";
import type { ProblemShort, ProblemShortArray } from "$schemas/problems/self";

let list = $state<ProblemShortArray>([]);
let deleteConformationDialog = $state<ConformationDialog>();
let problemToBeDeleted = $state<ProblemShort>();

const toaster = getToaster();
const problemClient = new ProblemApiClient();

function onSearch(problems: ProblemShortArray) {
  list = problems;
}

function onClickDelete(problem: ProblemShort) {
  problemToBeDeleted = problem;
  deleteConformationDialog?.setOpenState();
}

async function onDeleteResponse(answer: boolean) {
  if (!answer) {
    problemToBeDeleted = undefined;
    return;
  }

  const response = await problemClient.deleteProblemById(
    problemToBeDeleted?.id,
  );

  if (response.isErr()) {
    const err = response.unwrapErr();
    toaster.error(err?.message ?? "");
    console.error(err);
    return;
  }

  toaster.success(
    `Problem deleted successfully redirecting to /problems in 5sec`,
  );
  setTimeout(() => goto("/problems"), 5000);
}
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

<ConformationDialog
  bind:this={deleteConformationDialog}
  title="Delete Problem "
  content="Are you sure you want to delete problem with title "
  highlight={problemToBeDeleted?.problemStatement}
  onResponse={onDeleteResponse}
/>

<ProblemSearch {onSearch} loadListOnLoad />

<div class="grid lg:grid-cols-3 sm:grid-cols-1 md:grid-cols-2 gap-2">
  {#each list as problem}
    <ProblemCard {problem} {onClickDelete} />
  {/each}
</div>
