<script lang="ts">
import type { Tag } from "$lib/types";

type Props = {
  tagSearchQuery: string;
  selectItem: (tag: Tag) => void;
};

let { tagSearchQuery = $bindable(), selectItem }: Props = $props();

let tagsSearchList: Tag[] = $state([]);
let showDropdown = $state(false);

// Function to handle when user selects an item
function handleFocus() {
  showDropdown = true;
}

function handleBlur() {
  // Delay dropdown close to allow click on item
  setTimeout(() => (showDropdown = false), 200);
}

function closeDropdown() {
  showDropdown = false;
}

async function searchTags() {
  let data = await fetch("/tags", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tagName: tagSearchQuery }),
  }).then(d => d.json()) as Tag[];

  tagsSearchList = data;
}

function preventSubmit(event: KeyboardEvent) {
  if (event.key === "Enter") {
    event.preventDefault();
  }
}
</script>

<div id="tag-search-container" class="relative">
  <div class="flex">
    <input
      class="input input-bordered grow"
      placeholder="Search tags"
      id="tag-search"
      type="search"
      autocomplete="off"
      bind:value={tagSearchQuery}
      oninput={searchTags}
      onfocus={handleFocus}
      onblur={handleBlur}
      onkeydown={preventSubmit}
    />
    <button class="btn" type="button">Search Tag</button>
  </div>
  {#if showDropdown && tagsSearchList.length > 0}
    <div
      id="tag-search-list"
      class="border-solid border-2 grid grid-cols-1 absolute w-full bg-neutral"
    >
      {#each tagsSearchList as tag (tag.id)}
        <div
          class="cursor-pointer p-2"
          tabindex="0"
          data-tag-id={tag.id}
          data-tag-title={tag.title}
          role="button"
          onclick={() => {
            selectItem(tag);
            closeDropdown();
          }}
          onkeypress={() => {
            selectItem(tag);
            closeDropdown();
          }}
        >
          {tag.title}
        </div>
      {/each}
    </div>
  {:else if showDropdown && tagsSearchList.length === 0}
    <div>
      No tag found
    </div>
  {/if}
</div>

<style>
</style>
