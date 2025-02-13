<script lang="ts">
import { default as DeleteTagDialog } from "$components/ConformationDialog.svelte";
import { TagApiClient } from "$features/tags/api";
import {
  CreateTagDialog,
  TagCard,
  TagSearch,
  UpdateTagDialog,
} from "$features/tags/components";
import { Log } from "$lib/logger";
import { isErr } from "$lib/superposition";
import { getToaster } from "$lib/toaster.svelte";
import type { Tag } from "$type/tags";

let list = $state<Tag[]>([]);

const toaster = getToaster();
const tagClient = new TagApiClient();
let reset = $state(false);

const onSearch = (l: Tag[]) => {
  list = l;
};

let updateDialogRef = $state<UpdateTagDialog>();
let deleteDialogRef = $state<DeleteTagDialog>();
let createDialogRef = $state<CreateTagDialog>();

let tagToBeDeleted = $state<Tag>();
let tagToBeUpdated = $state<Tag>();

function onClickDelete(tag: Tag) {
  tagToBeDeleted = tag;
  deleteDialogRef?.setOpenState();
}

function onClickUpdate(tag: Tag) {
  tagToBeUpdated = tag;
  updateDialogRef?.setOpenState();
}

function onClickCreate() {
  createDialogRef?.setOpenState();
}

function resetForm() {
  reset = !reset;
}

async function onCreateSubmit(title: string): Promise<void> {
  const result = await tagClient.create({ title });

  if (isErr(result)) {
    toaster.error(
      result.unwrapErr().message ?? "Internal Server Error",
    );
    const errorObj = result.unwrapErr();
    Log.error(errorObj);
    // setFailureResponse(errorObj);
    return;
  }

  if (result.isOk()) {
    toaster.success("Tag saved");
    resetForm();
  }
}

async function onUpdateSubmit(title: string): Promise<void> {
  if (
    tagToBeUpdated?.title.trim().toLowerCase() === title.trim().toLowerCase()
  ) {
    toaster.warning("Update tag is same as original tag");
    return;
  }

  const result = await tagClient.update({ id: tagToBeUpdated?.id, title });

  if (isErr(result)) {
    toaster.error(
      result.unwrapErr().message ?? "Internal Server Error",
    );
    const errorObj = result.unwrapErr();
    Log.error(errorObj);
    return;
  }

  if (result.isOk()) {
    toaster.success("Tag saved");
    resetForm();
  }
}

async function onDeleteResponse(answer: boolean) {
  if (!answer) {
    return;
  }
  const result = await tagClient.deleteById(tagToBeDeleted?.id);

  if (isErr(result)) {
    toaster.error(
      result.unwrapErr().message ?? "Internal Server Error",
    );
    const errorObj = result.unwrapErr();
    Log.error(errorObj);
    // setFailureResponse(errorObj);
    return;
  }

  if (result.isOk()) {
    toaster.success("Tag deleted");
    resetForm();
  }
}
</script>

<svelte:head>
  <title>Tag form</title>
</svelte:head>

<DeleteTagDialog
  bind:this={deleteDialogRef}
  title="Delete Image "
  content="This action cannot be undone. This will permanently delete the tag: "
  highlight={tagToBeDeleted?.title}
  onResponse={onDeleteResponse}
/>
<UpdateTagDialog
  bind:this={updateDialogRef}
  tag={tagToBeUpdated}
  onSubmit={onUpdateSubmit}
  closeOnYes={true}
/>
<CreateTagDialog
  bind:this={createDialogRef}
  closeOnYes={true}
  onSubmit={onCreateSubmit}
/>

<div class="grid grid-cols-1 p-2 gap-4">
  <button
    class="bg-primary text-primary-content p-2 rounded-full active:scale-98 active:transition-all hover:bg-primary/95"
    onclick={onClickCreate}
  >
    Create Tag
  </button>

  <TagSearch {onSearch} loadListOnLoad />
  <div class="grid lg:grid-cols-3 sm:grid-cols-1 md:grid-cols-2 gap-2">
    {#each list as tag}
      <TagCard {tag} {onClickDelete} {onClickUpdate} />
    {:else}
      <div class="flex border border-secondary gap-1 rounded p-2">
        No tag found
      </div>
    {/each}
  </div>
</div>
