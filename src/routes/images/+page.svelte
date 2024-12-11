<script lang="ts">
import { applyAction, enhance } from "$app/forms";
import { invalidateAll } from "$app/navigation";
import TagSearch from "$lib/components/TagSearch.svelte";
import { getToastState } from "$lib/toast-state.svelte";
import type { Tag } from "$lib/types";
import type { ActionData, SubmitFunction } from "./$types";

const toastState = getToastState();
let { form }: { form: ActionData } = $props();
let selectedTags: Tag[] = $state([]);
let formElement = $state<HTMLFormElement>();
let titleInput = $state<HTMLInputElement>();
let tagSearchQuery: string = $state("");
let imageInputElement = $state<HTMLInputElement>();
let imagePreviewElement = $state<HTMLImageElement>();
let hasImage = $state(false);

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

function previewImage(event: Event) {
  const target = event.target as HTMLInputElement;
  const imageFiles = target.files;
  if (null === imageFiles) {
    console.error("Image file is null");
    return;
  }

  const imageFilesLength = imageFiles.length;
  if (imageFilesLength > 0) {
    const imageSrc = URL.createObjectURL(imageFiles[0]);
    if (imagePreviewElement) {
      imagePreviewElement.src = imageSrc;
    }
    hasImage = true;
  } else {
    if (imagePreviewElement) {
      imagePreviewElement.removeAttribute("src");
    }
    if (imageInputElement) {
      imageInputElement.value = "";
    }
    hasImage = false;
  }
}

function removeImage() {
  if (imagePreviewElement) {
    imagePreviewElement.removeAttribute("src");
  }
  if (imageInputElement) {
    imageInputElement.value = "";
  }
  hasImage = false;
}

const submitImage: SubmitFunction = (
  { formData, cancel },
) => {
  const { title } = Object.fromEntries(formData);
  if (title.toString().length < 1) {
    toastState.error("Title is empty");
    cancel();
  }

  return async ({ result }) => {
    let message = "";
    switch (result.type) {
      case "redirect":
        break;
      case "error":
        console.error(result);
        toastState.error(JSON.stringify(result.error), "Internal server error");
        break;
      case "success":
        formElement?.reset();
        removeImage();
        toastState.success("Image saved");
        break;
      case "failure":
        message = result.data?.error.title?.message ?? "";
        toastState.error(message);
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
  use:enhance={submitImage}
  bind:this={formElement}
  enctype="multipart/form-data"
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

    <TagSearch
      bind:tagSearchQuery
      selectItem={selectTag}
    />
  </div>

  <div class="px-2 py-4 flex flex-col gap-6">
    <label class="form-control">
      <div class="label">
        <span class="label-text">Pick a file</span>
        <span class="label-text-alt">Required</span>
      </div>
      <div class="flex gap-2">
        <input
          class="file-input file-input-bordered grow"
          type="file"
          id="image"
          name="file"
          accept="image/*"
          onchange={previewImage}
          bind:this={imageInputElement}
          required
        />
        <!-- 
         -->
        <button
          class=""
          id="remove-file"
          type="button"
          aria-label="search tag button"
          onclick={removeImage}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="inline-block h-4 w-4 stroke-current"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            >
            </path>
          </svg>
        </button>
      </div>
    </label>

    <div
      class:display-none={hasImage}
      class:skeleton={!hasImage}
      class="w-full grow min-h-12 image-preview-container"
    >
    </div>
    <img
      class:display-none={!hasImage}
      id="preview-selected-image"
      alt="preview"
      bind:this={imagePreviewElement}
    />
  </div>

  <button class="btn btn-primary rounded-lg" type="submit">
    Submit
  </button>
</form>

<style>
</style>
