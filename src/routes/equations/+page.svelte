<script lang="ts">
import { applyAction, enhance } from "$app/forms";
import { invalidateAll } from "$app/navigation";
import TagSearch from "$components/TagSearch.svelte";
import { getToaster } from "$lib/toaster.svelte";
import type { Tag } from "$type/tags";
import type { ActionData, SubmitFunction } from "./$types";

const toaster = getToaster();
let { form }: { form: ActionData } = $props();
let selectedTags: Tag[] = $state([]);
let formElement = $state<HTMLFormElement>();
let titleInput = $state<HTMLInputElement>();
let tagSearchRef = $state<TagSearch>();

function selectTag(tag: Tag) {
  if (selectedTags.findIndex(value => value.id === tag.id) !== -1) {
    return;
  }
  selectedTags.push(tag);
}

function removeTag(tagId: string) {
  const index = selectedTags.findIndex(value => value.id === tagId);

  if (index === -1) {
    return;
  }

  selectedTags = selectedTags.filter((ele) => ele.id !== tagId);
}

const submitEquation: SubmitFunction = (
  { formData, cancel },
) => {
  const { title } = Object.fromEntries(formData);
  if (title.toString().length < 1) {
    toaster.error("Title is empty");
    cancel();
  }

  return async ({ result }) => {
    let message = "";
    switch (result.type) {
      case "redirect":
        break;
      case "error":
        console.error(result);
        toaster.error(JSON.stringify(result.error), "Internal server error");
        break;
      case "success":
        formElement?.reset();
        toaster.success("Equation saved");
        break;
      case "failure":
        message = result.data?.error.title?.message ?? "";
        toaster.error(message);
        break;
    }
    await applyAction(result);
    await invalidateAll();
    titleInput?.focus();
  };
};

function resetError(key: "title") {
  if (form?.error?.hasOwnProperty(key)) {
    form.error[key] = undefined;
  }
}
</script>

<form
  id="form"
  method="POST"
  action="?/create"
  use:enhance={submitEquation}
  bind:this={formElement}
  class="mx-auto max-w-(--breakpoint-xl) grid sm:grid-cols-1 xl:grid-cols-2 gap-4"
>
  <div class="px-2 py-4 flex flex-col gap-6">
    <label class="form-control">
      <div class="label">
        <span class="label-text">Title</span>
        <span class="label-text-alt">Required</span>
      </div>
      <textarea
        id="title"
        class="textarea textarea-bordered w-full min-h-12 h-12"
        placeholder=""
        name="title"
        required
        aria-required="true"
      ></textarea>
    </label>

    <label class="form-control">
      <div class="label">
        <span class="label-text">Description</span>
        <span class="label-text-alt">Optional</span>
      </div>
      <textarea
        id="description"
        class="textarea textarea-bordered w-full min-h-12 h-52"
        placeholder=""
        name="description"
      ></textarea>
    </label>

    {#if selectedTags.length > 0}
      <div id="selected-tag-list" class="flex flex-wrap gap-2 items-center">
        {#each selectedTags as tag (tag.id)}
          <input
            type="checkbox"
            name="tags"
            value={tag.id}
            hidden
            aria-hidden="true"
            checked
          />
          <button
            class="h-8 px-4 rounded-full flex items-center gap-2 bg-accent text-neutral tag"
            type="button"
            data-tag-id={tag.id}
            data-tag-title={tag.title}
            onclick={() => {
              removeTag(tag.id);
            }}
          >
            <span class="tag-name"> {tag.title} </span>
            <span class=""> &times; </span>
          </button>
        {/each}
      </div>
    {/if}

    <TagSearch bind:this={tagSearchRef} />
  </div>

  <div class="px-2 py-4 flex flex-col gap-6">
    <label class="form-control h-full">
      <div class="label">
        <span class="label-text">Content</span>
        <span class="label-text-alt">Required</span>
      </div>
      <textarea
        id="content"
        class="textarea textarea-bordered w-full min-h-12 h-full"
        placeholder=""
        name="content"
        required
        aria-required="true"
      ></textarea>
    </label>
  </div>

  <button class="btn btn-primary rounded-lg" type="submit">
    Submit
  </button>
</form>

<style>
</style>
