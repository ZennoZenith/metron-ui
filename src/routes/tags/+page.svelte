<script lang="ts">
import { Edit, Trash } from "$icons";
import type { Tag } from "$lib/models/tags";
import CreateTagDialog from "./CreateTagDialog.svelte";
import TagSearch from "./TagSearch.svelte";

let list = $state<Tag[]>([
  { id: "id1", title: "title 1" },
  { id: "id2", title: "title 2" },
  { id: "id3", title: "title 3" },
  { id: "id4", title: "title 4" },
  { id: "id5", title: "title 5" },
  { id: "id6", title: "title 6" },
]);

const onSearch = (l: Tag[]) => {
  list = l;
};
</script>

<div class="grid grid-cols-1 p-2 gap-4">
  <CreateTagDialog />
  <TagSearch {onSearch} />
  {#if list}
    <div class="grid grid-cols-1 gap-2">
      {#each list as tag (tag.id)}
        <div class="flex border border-secondary gap-1 rounded p-2">
          <div class="flex-1">{tag.title}</div>
          <div class="flex gap-4 items-center">
            <Edit class="h-5 text-info" />
            <Trash class="h-5 text-error" />
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- 
<form
  method="POST"
  action="?/create"
  use:enhance={submitTag}
  id="form"
  class=""
>
  <div class="px-2 py-4 flex flex-col gap-6">
    <label class="">
      <div class="">
        <span class="">Title</span>
        <span class="">Required</span>
      </div>
      <input
        id="title"
        class=""
        autocomplete="off"
        name="title"
        type="text"
        placeholder="Title"
        required
        bind:this={titleInput}
        oninput={() => resetError("title")}
      />
      {#if form?.error}
        <div class="">
          <span class="">
            {form?.error?.title?.message}
          </span>
        </div>
      {/if}
    </label>

    <button class="" type="submit">
      Create tag
    </button>
  </div>
</form>

 -->
