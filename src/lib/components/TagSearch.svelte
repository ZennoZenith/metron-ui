<script lang="ts">
import Dropdown from "$components/Dropdown.svelte";
import { X } from "$icons";
import { Debounce, Searchable } from "$lib";
import type { Tag } from "$lib/models/tags";
import { setMySet } from "$lib/set.svelte";
import type { DropDownListItem } from "$types";
import { fetchJson, type Superposition } from "$utils";

const tagSearchable = new Searchable(100);
const debounce = new Debounce();

const SET_KEY = Symbol("SET");
const selectedTags = setMySet<Tag, "id">(SET_KEY, "id");
let tagIdsString = $derived(selectedTags.values.map(v => v.id).join(","));

let tagSearchQuery = $state("");
const knownTags = new Map<Tag["id"], Tag>();
let inputRef = $state<HTMLInputElement>();

let list = $state<DropDownListItem[]>([]);

export function clearSelectedTags() {
  selectedTags.clear();
  list.forEach(v => v.selected = false);
}

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
  inputRef?.focus();
}

function removeTag(tagId: Tag["id"]) {
  console.log(tagId);
  if (!knownTags.get(tagId)) return;
  selectedTags.deleteByKey(tagId);

  const item = list.find(v => v.key === tagId);
  if (!item) return;
  item.selected = false;
  inputRef?.focus();
}
</script>

<div
  id="tag-search-container"
  class="min-h-fit"
  onfocusout={tagSearchable.onFocusLoss}
>
  <div
    class="flex p-2 gap-2 flex-wrap border rounded border-solid border-base-content min-h-fit items-center"
  >
    {#each selectedTags.values as tag}
      <button
        type="button"
        class="bg-info text-info-content font-semibold pl-3 pr-1 rounded-full flex items-center gap-1"
        onclick={() => removeTag(tag.id)}
      >
        {tag.title} <X class="text-error h-5" />
      </button>
    {/each}
    <input
      bind:this={inputRef}
      class="min-w-16 rounded grow outline-none"
      placeholder="Search tags"
      id="tag-search"
      type="search"
      autocomplete="off"
      bind:value={tagSearchQuery}
      oninput={searchTags}
      onfocus={tagSearchable.onFocus}
    />
  </div>
  <div class="relative w-full h-0">
    <!-- 
      anchorName="--dropdown-anchor-1"
     -->
    <Dropdown
      searchable={tagSearchable}
      multiple
      onSelect={onTagSelect}
      bind:list
    />
  </div>
</div>

<input type="hidden" name="tags" value={tagIdsString}>

<style>
/* .anchor {
  anchor-name: --dropdown-anchor-1;
} */
</style>
