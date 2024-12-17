<script lang="ts">
import Dropdown from "$components/Dropdown.svelte";
import { Debounce, Searchable } from "$lib";
import type { Tag } from "$lib/models/tags";
import { setMySet } from "$lib/set.svelte";
import type { DropDownListItem } from "$types";
import { fetchJson, type Superposition } from "$utils";

const tagSearchable = new Searchable(100);
const debounce = new Debounce();

const SET_KEY = Symbol("SET");
const selectedTags = setMySet<Tag, "id">(SET_KEY, "id");

let tagSearchQuery = $state("");
const knownTags = new Map<Tag["id"], Tag>();

let list = $state<DropDownListItem[]>([
  {
    dataText: "Hello",
    key: "key1",
    text: "Some text 1",
    disabled: true,
    selected: false,
  },
  {
    dataText: "Hello",
    key: "key2",
    text: "Some text 2",
    selected: true,
  },
]);

async function autocomplete(query: string) {
  const errorJson = await fetchJson<Superposition<{}, Tag[]>>(
    "/api/tags",
    {
      method: "POST",
      body: JSON.stringify({ search: query }),
      headers: {
        "content-type": "application/json",
      },
    },
  );

  if (!errorJson.success) {
    console.error(errorJson.error);
    return;
  }

  if (!errorJson.data.success) {
    console.error(errorJson.data.error);
    return;
  }

  let tags = errorJson.data.data;
  list = tags.map(v => {
    return {
      dataText: v.title,
      text: v.title,
      key: v.id,
      selected: selectedTags.hasKey(v.id),
    } as DropDownListItem;
  });

  tags.forEach(v => knownTags.set(v.id, v));
}

async function searchTags() {
  if (tagSearchQuery.trim().length === 0) {
    return;
  }

  debounce.debounceAsync(autocomplete)(tagSearchQuery);
}

function onTagSelect(selectedItem: DropDownListItem) {
  const tag = knownTags.get(selectedItem.key);
  if (!tag) return;

  if (selectedItem.selected) {
    selectedTags.add(tag);
  } else {
    selectedTags.deleteByKey(tag.id);
  }
}
</script>

<div
  id="tag-search-container"
  class="relative"
  onfocusout={tagSearchable.onFocusLoss}
>
  <div class="flex">
    <input
      class="h-12 p-2 rounded-sm border border-solid border-base-content grow rounded-r-none border-r-0"
      placeholder="Search tags"
      id="tag-search"
      type="search"
      autocomplete="off"
      bind:value={tagSearchQuery}
      oninput={searchTags}
      onfocus={tagSearchable.onFocus}
    />
    <Dropdown
      searchable={tagSearchable}
      multiple
      onSelect={onTagSelect}
      bind:list
    />

    <button
      class="bg-secondary text-secondary-content px-4 border border-solid border-base-content border-l-0"
      type="button"
      onclick={searchTags}
    >
      Search Tag
    </button>
  </div>
</div>

{#each selectedTags.values as tag (tag.id)}
  <input type="hidden" name="tags" value={tag.id}>
{/each}

<style>
</style>
