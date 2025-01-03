<script lang="ts">
import { Edit, ExternalLink, Trash } from "$icons";
import type { Equation } from "$type/equations";

type Props = {
  equation: Equation;
  onClickDelete?: (equation: Equation) => void;
};

const { equation, onClickDelete = () => {} }: Props = $props();
</script>

<div class="rounded-xl bg-base-200 flex flex-col">
  <div class="p-2 bg-base-300 rounded-b-xl flex-1 flex flex-col gap-2">
    <a
      class="font-bold text-xl mb-1 flex items-center gap-2"
      href="/equations/{equation.id}"
      target="_blank"
    >
      {equation.title} <ExternalLink />
    </a>
    <div class="flex gap-2">
      {#each equation.tags as tag}
        <div class="bg-info text-info-content font-semibold rounded-full px-4">
          {tag.title}
        </div>
      {/each}
    </div>
    <div class="flex-1">
      {equation.description}
    </div>
    <div class="mt-4 flex-1">
      {equation.content}
    </div>
    <div>{new Date(equation.createdAt).toLocaleString()}</div>
    <div class="flex justify-between">
      <a href="/equations/{equation.id}?edit=true" target="_blank">
        <button
          class="flex gap-2 items-center bg-warning text-warning-content rounded-full px-4 py-1"
        >
          Edit <Edit />
        </button>
      </a>
      <button
        class="flex gap-2 items-center bg-error text-error-content rounded-full px-4 py-1"
        onclick={() => onClickDelete(equation)}
      >
        Delete <Trash />
      </button>
    </div>
  </div>
</div>
