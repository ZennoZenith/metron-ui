<script lang="ts">
import Dropdown from "$components/Dropdown.svelte";
import { TagApiClient } from "$features/tags/api";
import { X } from "$icons";
import { Log } from "$lib/logger";
import type { DropDownListItem } from "$type";
import type { Tag } from "$type/tags";
import { Debounce } from "$utils/debounce";
import { Searchable } from "$utils/searchable.svelte";
import { setMySet } from "$utils/set.svelte";

type Props = {
  disabled?: boolean;
  defaultSelectedTags?: Tag[];
  onChange?: (value: string) => void;
};

let {
  disabled = false,
  defaultSelectedTags = [],
  onChange = () => {},
}: Props = $props();

const tagSearchable = new Searchable(100);
const debounce = new Debounce();
const tagClient = new TagApiClient();

const SET_KEY = Symbol("SET");
const selectedTags = setMySet<Tag, "id">(SET_KEY, "id");
defaultSelectedTags.forEach(v => selectedTags.add(v));
let tagIdsString = $state("");
let tagSearchQuery = $state("");
const knownTags = new Map<Tag["id"], Tag>();
let inputRef = $state<HTMLInputElement>();

let list = $state<DropDownListItem[]>([]);

export function clearSelectedTags() {
  selectedTags.clear();
  list.forEach(v => v.selected = false);
}

async function autocomplete(query: string) {
  const maybeTags = await tagClient.searchByQueryTitle({ search: query });

  if (maybeTags.isErr()) {
    Log.error(maybeTags.unwrapErr());
    return;
  }

  const tags = maybeTags.unwrap();
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

  tagIdsString = selectedTags.values.map(v => v.id).join(",");
  onChange(getTagIdStrings());

  inputRef?.focus();
}

function removeTag(tagId: Tag["id"]) {
  selectedTags.deleteByKey(tagId);

  const item = list.find(v => v.key === tagId);
  if (!item) return;
  item.selected = false;

  tagIdsString = selectedTags.values.map(v => v.id).join(",");
  onChange(getTagIdStrings());

  inputRef?.focus();
}

export function getTagIdStrings() {
  return $state.snapshot(tagIdsString);
}
</script>

<div
  class="min-h-fit"
  onfocusout={tagSearchable.onFocusLoss}
>
  <div
    class="flex p-2 gap-2 flex-wrap border rounded border-solid border-base-content min-h-fit items-center"
  >
    {#each selectedTags.values as tag}
      <button
        type="button"
        class="bg-info text-info-content font-semibold px-3 rounded-full flex items-center gap-1"
        onclick={() => removeTag(tag.id)}
        {disabled}
      >
        {tag.title} {#if !disabled} <X class="text-error h-5" /> {/if}
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
      hidden={disabled}
      {disabled}
    />
  </div>
  <div class="relative w-full h-0">
    <Dropdown
      searchable={tagSearchable}
      multiple
      onSelect={onTagSelect}
      bind:list
    />
  </div>
</div>

<input type="hidden" name="tags" value={tagIdsString}>
