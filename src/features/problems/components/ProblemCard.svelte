<script lang="ts">
import { Edit, ExternalLink, Trash } from "$icons";
import type { ProblemShort } from "$type/problems";

type Props = {
  problem: ProblemShort;
  onClickDelete?: (problem: ProblemShort) => void;
};

const { problem, onClickDelete = () => {} }: Props = $props();
</script>

<div class="rounded-xl bg-base-200 flex flex-col">
  <div class="p-2 bg-base-300 rounded-b-xl flex-1 flex flex-col gap-2">
    <a
      class="font-bold text-xl mb-1 flex items-center gap-2"
      href="/problems/{problem.id}"
      target="_blank"
    >
      {problem.questionType} <ExternalLink />
    </a>
    <div class="flex gap-2">
      {#each problem.tags as tag}
        <div class="bg-info text-info-content font-semibold rounded-full px-4">
          {tag.title}
        </div>
      {/each}
    </div>
    <div class="flex-1">
      {problem.problemStatement}
    </div>
    <div>{new Date(problem.createdAt).toLocaleString()}</div>
    <div class="flex justify-between">
      <a href="/problems/{problem.id}?edit=true" target="_blank">
        <button
          class="flex gap-2 items-center bg-warning text-warning-content rounded-full px-4 py-1"
        >
          Edit <Edit />
        </button>
      </a>
      <button
        class="flex gap-2 items-center bg-error text-error-content rounded-full px-4 py-1"
        onclick={() => onClickDelete(problem)}
      >
        Delete <Trash />
      </button>
    </div>
  </div>
</div>
