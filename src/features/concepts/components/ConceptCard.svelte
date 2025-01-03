<script lang="ts">
import { Edit, ExternalLink, Trash } from "$icons";
import type { ConceptShort } from "$type/concepts";

type Props = {
  concept: ConceptShort;
  onClickDelete?: (concept: ConceptShort) => void;
};

const { concept, onClickDelete = () => {} }: Props = $props();
</script>

<div class="rounded-xl bg-base-200 flex flex-col">
  <div class="p-2 bg-base-300 rounded-b-xl flex-1 flex flex-col gap-2">
    <a
      class="font-bold text-xl mb-1 flex items-center gap-2"
      href="/concepts/{concept.id}"
      target="_blank"
    >
      {concept.title} <ExternalLink />
    </a>
    <div class="flex gap-2">
      {#each concept.tags as tag}
        <div class="bg-info text-info-content font-semibold rounded-full px-4">
          {tag.title}
        </div>
      {/each}
    </div>
    <div class="flex-1">
      {concept.description}
    </div>
    <div>{new Date(concept.createdAt).toLocaleString()}</div>
    <div class="flex justify-between">
      <a href="/concepts/{concept.id}?edit=true" target="_blank">
        <button
          class="flex gap-2 items-center bg-warning text-warning-content rounded-full px-4 py-1"
        >
          Edit <Edit />
        </button>
      </a>
      <button
        class="flex gap-2 items-center bg-error text-error-content rounded-full px-4 py-1"
        onclick={() => onClickDelete(concept)}
      >
        Delete <Trash />
      </button>
    </div>
  </div>
</div>
