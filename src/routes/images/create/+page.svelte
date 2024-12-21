<script lang="ts">
import { applyAction, enhance } from "$app/forms";
import { goto, invalidateAll } from "$app/navigation";
import TagSearch from "$components/TagSearch.svelte";
import {
  type CreateIssues,
  validateCreateSchema,
} from "$features/images/models/create";
import { X } from "$icons";
import type { ErrorObject } from "$lib/error";
import { getToaster } from "$lib/toaster.svelte";
import { fade } from "svelte/transition";
import type { SubmitFunction } from "../$types";

let tagSearchRef = $state<TagSearch>();
const toaster = getToaster();
let imageInputElement = $state<HTMLInputElement>();
let imagePreviewElement = $state<HTMLImageElement>();
let imageType = $state("");
let hasImage = $state(false);
let failureResopnse = $state<CreateIssues & { message?: string }>();

function setFailureResponse(error?: ErrorObject) {
  if (error?.type === "validation-error") {
    failureResopnse = {
      ...error.extra,
      message: error?.message,
    };
  } else {
    failureResopnse = {
      message: error?.message,
    };
  }
}

function previewImage(event: Event) {
  if (!imagePreviewElement) return;
  if (!imageInputElement) return;

  const target = event.target as HTMLInputElement;
  const imageFiles = target.files;
  if (null === imageFiles) {
    console.error("Image file is null");
    return;
  }

  if (imageFiles.length > 0) {
    const imageSrc = URL.createObjectURL(imageFiles[0]);
    imagePreviewElement.src = imageSrc;
    imagePreviewElement.removeAttribute("hidden");
    imageType = imageFiles[0].type;
    hasImage = true;
  } else {
    imagePreviewElement.removeAttribute("src");
    imagePreviewElement.hidden = true;
    imageInputElement.value = "";
    hasImage = false;
  }
}

function removeImage() {
  if (!imagePreviewElement) return;
  if (!imageInputElement) return;

  imagePreviewElement.removeAttribute("src");
  imagePreviewElement.hidden = true;
  imageInputElement.value = "";
  hasImage = false;
}

const submitImage: SubmitFunction = (
  { formData, cancel },
) => {
  if (formData.get("description")?.toString().trim() === "") {
    formData.delete("description");
  }
  if (formData.get("tags")?.toString().trim() === "") {
    formData.delete("tags");
  }

  const formEntries = Object.fromEntries(formData.entries());
  let parsed = validateCreateSchema(formEntries);

  if (parsed.isErr()) {
    setFailureResponse(parsed.err?.error);
    toaster.error("Invalid form data");
    cancel();
    return;
  }

  return async ({ result, formElement }) => {
    switch (result.type) {
      case "redirect":
        goto(result.location);
        break;
      case "error":
        toaster.error(result.error.message ?? "Internal Server Error");
        break;
      case "success":
        formElement.reset();
        removeImage();
        tagSearchRef?.clearSelectedTags();
        toaster.success("Image saved");
        break;
      case "failure":
        setFailureResponse(result.data);
        toaster.error(result.data?.message ?? "");
        break;
    }

    await applyAction(result);
    await invalidateAll();
  };
};
</script>

<form
  id="form"
  method="POST"
  action="/images?/create"
  use:enhance={submitImage}
  enctype="multipart/form-data"
  class="mx-auto max-w-(--breakpoint-xl) grid sm:grid-cols-1 xl:grid-cols-2 gap-4"
>
  <div class="px-2 py-4 flex flex-col gap-6">
    <label class="">
      <div class="">
        Title <span class="text-error" aria-label="required"> * </span>
      </div>
      <textarea
        id="title"
        class="w-full text-xl h-12 min-h-12 p-2 rounded border border-solid border-base-content"
        placeholder=""
        name="title"
        required
      ></textarea>
      {#if failureResopnse?.title}
        <div class="text-error">
          {failureResopnse.title[0]}
        </div>
      {/if}
    </label>

    <label class="">
      <div class="label">
        Description <span aria-label="optional"></span>
      </div>
      <textarea
        id="description"
        class="w-full text-xl min-h-12 h-52 p-2 rounded border border-solid border-base-content"
        placeholder=""
        name="description"
      ></textarea>
      {#if failureResopnse?.description}
        <div class="text-error">
          {failureResopnse.description[0]}
        </div>
      {/if}
    </label>

    <TagSearch bind:this={tagSearchRef} />
    {#if failureResopnse?.tags}
      <div class="text-error">
        {failureResopnse.tags[0]}
      </div>
    {/if}
  </div>

  <div class="px-2 py-4 flex flex-col gap-6">
    <label class="">
      <div class="">
        Pick an image <span class="text-error" aria-label="required"> * </span>
      </div>
      <div
        class="flex gap-2 rounded border border-solid border-base-content items-center"
      >
        <input
          bind:this={imageInputElement}
          class="grow"
          type="file"
          id="image"
          name="image"
          accept=".png,.jpeg,.svg"
          onchange={previewImage}
          required
        />
        {#if hasImage}
          <button
            class="mr-1"
            id="remove-file"
            type="button"
            aria-label="remove image"
            onclick={removeImage}
            transition:fade={{ duration: 100 }}
          >
            <X />
          </button>
        {/if}
      </div>
      {#if failureResopnse?.image}
        <div class="text-error">
          {failureResopnse.image[0]}
        </div>
      {/if}
    </label>

    <input type="hidden" name="imageType" value={imageType}>
    <img
      bind:this={imagePreviewElement}
      id="preview-selected-image"
      alt="preview"
      hidden
    />
  </div>

  <button
    class="px-4 font-semibold active:scale-98 active:transition-all bg-primary text-primary-content py-2 rounded-full"
    type="submit"
  >
    Submit
  </button>
</form>

<style>
input[type="file"]::file-selector-button {
  border-radius: 0.25rem;
  padding: 0 1rem;
  height: 2rem;
  cursor: pointer;
  background-color: var(--color-secondary);
  color: var(--color-secondary-content);
  border: 1px solid rgba(0, 0, 0, 0.16);
  box-shadow: 0px 1px 0px rgba(0, 0, 0, 0.05);
  margin-right: 16px;
  transition: background-color 100ms;
}

/* file upload button hover state */
input[type="file"]::file-selector-button:hover {
  background-color: color(from var(--color-secondary) srgb r g b / 0.9);
}

/* file upload button active state */
input[type="file"]::file-selector-button:active {
  background-color: color(from var(--color-secondary) srgb r g b / 0.8);
}
</style>
