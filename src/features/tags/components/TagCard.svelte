<script lang="ts">
import { Edit, Trash } from "$icons";
import type { Tag } from "$type/tags";

type Props = {
  tag: Tag;
  onClickDelete?: (tag: Tag) => void;
  onClickUpdate?: (tag: Tag) => void;
};

const { tag, onClickDelete = () => {}, onClickUpdate = () => {} }: Props =
  $props();
</script>

<div class="flex border border-secondary gap-1 rounded p-2">
  <div class="flex-1">{tag.title}</div>
  <div class="flex gap-4 items-center">
    <button
      type="button"
      onclick={() => onClickUpdate(tag)}
    >
      <Edit class="h-5 text-info" />
    </button>
    <button
      type="button"
      onclick={() => onClickDelete(tag)}
    >
      <Trash class="h-5 text-error" />
    </button>
  </div>
</div>
