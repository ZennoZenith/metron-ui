<script lang="ts">
// import { applyAction, enhance } from "$app/forms";
// import { invalidateAll } from "$app/navigation";
import TagSearch from "$components/TagSearch.svelte";
import { X } from "$icons";
import { fade } from "svelte/transition";
// import { getToaster } from "$lib/toaster.svelte";
// import type { ActionData, SubmitFunction } from "./$types";

// const toaster = getToaster();
// let { form }: { form: ActionData } = $props();
let imageInputElement = $state<HTMLInputElement>();
let imagePreviewElement = $state<HTMLImageElement>();
let hasImage = $state(false);

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

// const submitImage: SubmitFunction = (
//   { formData, cancel },
// ) => {
//   const { title } = Object.fromEntries(formData);
//   if (title.toString().length < 1) {
//     toaster.error("Title is empty");
//     cancel();
//   }

//   return async ({ result }) => {
//     let message = "";
//     switch (result.type) {
//       case "redirect":
//         break;
//       case "error":
//         console.error(result);
//         toaster.error(JSON.stringify(result.error), "Internal server error");
//         break;
//       case "success":
//         formElement?.reset();
//         removeImage();
//         toaster.success("Image saved");
//         break;
//       case "failure":
//         message = result.data?.error.title?.message ?? "";
//         toaster.error(message);
//         break;
//     }
//     await applyAction(result);
//     await invalidateAll();
//     titleInput?.focus();
//   };
// };

// function resetError(key: "title") {
//   if (form?.error?.hasOwnProperty(key)) {
//     form.error[key] = undefined;
//   }
// }
</script>

<!-- 
  use:enhance={submitImage}
 -->
<form
  id="form"
  method="POST"
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
        class="w-full text-xl h-12 min-h-12 p-2 rounded-sm border border-solid border-base-content"
        placeholder=""
        name="title"
        required
      ></textarea>
    </label>

    <label class="">
      <div class="label">
        Description <span aria-label="optional"></span>
      </div>
      <textarea
        id="description"
        class="w-full text-xl min-h-12 h-52 p-2 rounded-sm border border-solid border-base-content"
        placeholder=""
        name="description"
      ></textarea>
    </label>

    <TagSearch />
  </div>

  <div class="px-2 py-4 flex flex-col gap-6">
    <label class="">
      <div class="">
        Pick a file <span class="text-error" aria-label="required"> * </span>
      </div>
      <div
        class="flex gap-2 rounded-sm border border-solid border-base-content items-center"
      >
        <input
          bind:this={imageInputElement}
          class="grow"
          type="file"
          id="image"
          name="file"
          accept=".png,.jpeg,.svg"
          onchange={previewImage}
          required
        />
        {#if hasImage}
          <button
            class="mr-1"
            id="remove-file"
            type="button"
            aria-label="search tag button"
            onclick={removeImage}
            transition:fade={{ duration: 100 }}
          >
            <X />
          </button>
        {/if}
      </div>
    </label>

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
