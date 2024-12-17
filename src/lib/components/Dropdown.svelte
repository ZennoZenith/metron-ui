<script lang="ts">
import { Check } from "$icons";
import type { Searchable } from "$lib";
import type { DropDownListItem } from "$lib/types";

type Props = {
  // anchorName: `--${string}`;
  searchable: Searchable;
  onSelect?: (
    selectedItem: DropDownListItem,
    event?: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
  ) => void;
  list: DropDownListItem[];
  multiple?: boolean;
};

let {
  // anchorName,
  searchable,
  onSelect = () => {},
  list = $bindable(),
  multiple = false,
}: Props = $props();

// $inspect(list);
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
  <!-- 
    class="anchored flex flex-col z-10"
    style={`position-anchor: ${anchorName};`}
   -->
  <div class="w-full flex flex-col z-10">
    {#if list.length === 0}
      <div
        class="bg-base-300 text-surface-content px-3 overflow-hidden flex items-center hover:bg-base-100 h-10 whitespace-nowrap"
      >
        No result found
      </div>
    {/if}
    {#each list as item (item.key)}
      <button
        class="{item?.disabled === true ? 'bg-zinc-700 text-surface-content/80' : 'bg-base-300 text-surface-content hover:bg-base-100'} px-3 overflow-hidden flex items-center h-10 whitespace-nowrap"
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

<style>
/* .anchored {
  position: fixed;
  left: anchor(left);
  top: calc(anchor(bottom) + 0.25rem);
  width: anchor-size(width);
} */
</style>
