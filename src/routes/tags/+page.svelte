<script lang="ts">
import { Edit, Trash } from "$icons";
import type { Tag } from "$type/tags";
import CreateTagDialog from "./components/CreateTagDialog.svelte";
import DeleteTagDialog from "./components/DeleteTagDialog.svelte";
import TagSearch from "./components/TagSearch.svelte";
import UpdateTagDialog from "./components/UpdateTagDialog.svelte";

let selectedTag = $state<Tag>();
let list = $state<Tag[]>();

const onSearch = (l: Tag[]) => {
  list = l;
};

let updateDialog = $state<UpdateTagDialog>();
let deleteDialog = $state<DeleteTagDialog>();
</script>

<div class="grid grid-cols-1 p-2 gap-4">
  <CreateTagDialog />
  <TagSearch {onSearch} loadListOnLoad />
  {#if list && list.length > 0}
    <div class="grid grid-cols-1 gap-2">
      <UpdateTagDialog bind:this={updateDialog} tag={selectedTag} />
      <DeleteTagDialog bind:this={deleteDialog} tag={selectedTag} />

      {#each list as tag (tag.id)}
        <div class="flex border border-secondary gap-1 rounded p-2">
          <div class="flex-1">{tag.title}</div>
          <div class="flex gap-4 items-center">
            <button
              type="button"
              onclick={() => {
                selectedTag = tag;
                updateDialog?.openDialog();
              }}
            >
              <Edit class="h-5 text-info" />
            </button>
            <button
              type="button"
              onclick={() => {
                selectedTag = tag;
                deleteDialog?.openDialog();
              }}
            >
              <Trash class="h-5 text-error" />
            </button>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="flex border border-secondary gap-1 rounded p-2">
      No tag found
    </div>
  {/if}
</div>
