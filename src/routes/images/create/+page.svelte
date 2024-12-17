<script lang="ts">
// import { applyAction, enhance } from "$app/forms";
// import { invalidateAll } from "$app/navigation";
import TagSearch from "$components/TagSearch.svelte";
import type { Tag } from "$lib/models/tags";
// import { getToaster } from "$lib/toaster.svelte";
// import type { ActionData, SubmitFunction } from "./$types";

// const toaster = getToaster();
// let { form }: { form: ActionData } = $props();
let selectedTags: Tag[] = [];
let imageInputElement = $state<HTMLInputElement>();
let imagePreviewElement = $state<HTMLImageElement>();
let hasImage = $state(false);

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
        class="w-full text-xl min-h-12 h-52 rounded-sm border border-solid border-base-content"
        placeholder=""
        name="description"
      ></textarea>
    </label>

    <TagSearch selectedTagList={selectedTags} />
  </div>

  <div class="px-2 py-4 flex flex-col gap-6">
    <label class="">
      <div class="">
        Pick a file <span class="text-error" aria-label="required"> * </span>
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

    {#if hasImage}
      <img
        id="preview-selected-image"
        alt="preview"
        bind:this={imagePreviewElement}
      />
    {/if}
  </div>

  <button
    class="px-4 font-semibold active:scale-98 active:transition-all bg-primary text-primary-content py-2 rounded-full"
    type="submit"
  >
    Submit
  </button>
</form>
