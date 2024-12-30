<script lang="ts">
import { Check } from "$icons";
import type { DropDownListItem } from "$type";
import type { Searchable } from "$utils/searchable.svelte";

type Props = {
  searchable: Searchable;
  onSelect?: (
    selectedItem: DropDownListItem,
    event?: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
  ) => void;
  list: DropDownListItem[];
  multiple?: boolean;
};

let {
  searchable,
  onSelect = () => {},
  list = $bindable(),
  multiple = false,
}: Props = $props();

function selectDropdownItem(
  event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
) {
  const key: DropDownListItem["key"] | undefined =
    event.currentTarget.dataset.key;
  let selectedItem = list.find((val) => val.key === key);

  if (!selectedItem) return;
  if (selectedItem.disabled) return;
  selectedItem.selected = !selectedItem.selected;

  if (!multiple) {
    searchable.closeDropdown();
  }
  onSelect($state.snapshot(selectedItem), event);
}
</script>

{#if searchable.showDropdown}
  <div class="w-full max-h-60 overflow-y-auto">
    {#if list.length === 0}
      <div
        class="w-full bg-base-300 text-surface-content px-3 overflow-hidden flex items-center hover:bg-base-100 h-10 whitespace-nowrap z-10"
      >
        No result found
      </div>
    {/if}
    {#each list as item (item.key)}
      <button
        class="{item?.disabled === true ? 'bg-zinc-700 text-surface-content/80' : 'bg-base-300 text-surface-content hover:bg-base-100'} w-full px-3 overflow-hidden flex items-center h-10 z-10"
        type="button"
        data-key={item.key}
        data-data-text={item.dataText}
        onclick={selectDropdownItem}
        aria-disabled={item?.disabled === true ? "true" : "false"}
      >
        {#if multiple}
          <span class="w-8">
            {#if item.selected}
              <Check />
            {/if}
          </span>
        {/if}
        {item.text}
      </button>
    {/each}
  </div>
{/if}
