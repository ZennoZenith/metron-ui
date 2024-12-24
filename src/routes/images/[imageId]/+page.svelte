<script lang="ts">
import { applyAction, enhance } from "$app/forms";
import { goto } from "$app/navigation";
import ConformationDialog from "$components/ConformationDialog.svelte";
import { Switch } from "$components/melt";
import TagSearch from "$components/TagSearch.svelte";
import {
  type UpdateIssues,
  validateUpdateSchema,
} from "$features/images/models/update";
import { Edit, Trash, X } from "$icons";
import type { ErrorObject } from "$lib/error";
import { getToaster } from "$lib/toaster.svelte";
import { base64ToFile } from "$utils/imageConversion";
import { validateUuid } from "$utils/uuid";
import { fade } from "svelte/transition";
import type { SubmitFunction } from "../$types";
import type { PageData } from "./$types";

const toaster = getToaster();

let deleteFormRef = $state<HTMLFormElement>();
let imageInputElement = $state<HTMLInputElement>();
let deleteConformationDialog = $state<ConformationDialog>();
let failureResopnse = $state<UpdateIssues & { message?: string }>();

const { data }: { data: PageData } = $props();
let edit = $state(data.edit);
const image = data.image;
let useNewImage = $state(false);

const defaultImageSrc = data.imageSrc; // encoded as base64
const defaultImageType = data.imageType;
const defaultImageFile = base64ToFile(
  defaultImageSrc,
  "current",
  defaultImageType,
);

let newImageSrc = $state("");
let newImageType = $state("");
let newImageFile = $state<File>();

let imageSrc = $state(defaultImageSrc);
let imageType = $state(defaultImageType);

function onDeleteResponse(answer: boolean) {
  if (answer) {
    deleteFormRef?.requestSubmit();
  }
}

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

function updatePreviewImage() {
  if (useNewImage) {
    imageSrc = newImageSrc;
    imageType = newImageType;
  } else {
    imageSrc = defaultImageSrc;
    imageType = defaultImageType;
  }
}
function previewImage(
  event: Event & { currentTarget: EventTarget & HTMLInputElement },
) {
  const imageFiles = event.currentTarget.files;
  if (null === imageFiles) {
    console.error("Image file is null");
    return;
  }

  if (imageFiles.length > 0) {
    const file = imageFiles[0];
    const src = URL.createObjectURL(file);
    newImageSrc = src;
    newImageFile = file;
    newImageType = imageFiles[0].type;
  } else {
    newImageSrc = "";
    newImageType = "";
    newImageFile = undefined;
  }
  updatePreviewImage();
}

function removeImage() {
  console.log("remove image");
  newImageSrc = "";
  newImageType = "";
  newImageFile = undefined;
  updatePreviewImage();
  if (imageInputElement) {
    imageInputElement.value = "";
  }
}

const deleteImage: SubmitFunction = (
  { formData, formElement, cancel },
) => {
  const { id } = Object.fromEntries(formData.entries());
  const isValidUuid = validateUuid(id.toString());

  if (!isValidUuid) {
    toaster.error("Invalid image id:uuid");
    cancel();
    return;
  }

  return async ({ result }) => {
    switch (result.type) {
      case "redirect":
        goto(result.location);
        break;
      case "error":
        toaster.error(result.error.message ?? "Internal Server Error");
        break;
      case "success":
        formElement.reset();
        toaster.success(
          `Image deleted successfully redirecting to /images in 5sec`,
        );
        setTimeout(() => goto("/images"), 5000);
        break;
      case "failure":
        toaster.error(result.data?.message ?? "");
        break;
    }
    await applyAction(result);
  };
};

const updateImage: SubmitFunction = (
  { formData, cancel },
) => {
  if (formData.get("description")?.toString().trim() === "") {
    formData.delete("description");
  }
  if (formData.get("tags")?.toString().trim() === "") {
    formData.delete("tags");
  }
  if (useNewImage && newImageFile) {
    formData.set(
      "image",
      new Blob([newImageFile], { type: newImageFile.type }),
    );
  } else if (useNewImage === false) {
    formData.set(
      "image",
      new Blob([defaultImageFile], { type: defaultImageFile.type }),
    );
  }

  const formEntries = Object.fromEntries(formData.entries());

  let parsed = validateUpdateSchema(formEntries);

  if (parsed.isErr()) {
    setFailureResponse(parsed.err?.error);
    toaster.error("Invalid form data");
    console.log(parsed.unwrapErr().error);
    cancel();
    return;
  }

  return async ({ result }) => {
    switch (result.type) {
      case "redirect":
        goto(result.location);
        break;
      case "error":
        toaster.error(result.error.message ?? "Internal Server Error");
        break;
      case "success":
        toaster.success("Image saved");
        setTimeout(() => window.location.replace(`/images/${image.id}`), 5000);
        break;
      case "failure":
        setFailureResponse(result.data);
        toaster.error(result.data?.message ?? "");
        break;
    }

    await applyAction(result);
  };
};
</script>

<ConformationDialog
  bind:this={deleteConformationDialog}
  title="Delete Image "
  content="Are you sure you want to delete image"
  onResponse={onDeleteResponse}
/>
<form
  bind:this={deleteFormRef}
  method="POST"
  action="/images?/delete"
  use:enhance={deleteImage}
  hidden
  class="absolute w-0 h-0 overflow-hidden"
>
  <input
    name="id"
    class="inline-flex h-8 w-full flex-1 items-center justify-center rounded-sm border border-solid border-neutral px-3 leading-none"
    value={image.id}
    type="hidden"
    aria-disabled="true"
  />
</form>

<div class="flex justify-between mx-auto max-w-(--breakpoint-xl)">
  <button
    class="flex gap-2 items-center bg-warning text-warning-content rounded-full px-4 py-1"
    onclick={() => edit = !edit}
  >
    {#if edit}
      Cancel Edit
    {:else}
      Edit
    {/if}
    <Edit />
  </button>
  {#if !edit}
    <button
      class="flex gap-2 items-center bg-error text-error-content rounded-full px-4 py-1"
      onclick={() => deleteConformationDialog?.openDialog()}
    >
      Delete
      <Trash />
    </button>
  {/if}
</div>

<form
  id="form"
  method="POST"
  action="/images?/update"
  use:enhance={updateImage}
  enctype="multipart/form-data"
  class="mx-auto max-w-(--breakpoint-xl) grid sm:grid-cols-1 xl:grid-cols-2 gap-4"
>
  <input type="hidden" name="id" value={image.id}>
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
        value={image.title}
        disabled={!edit}
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
        value={image.description ?? ""}
        disabled={!edit}
      ></textarea>
      {#if failureResopnse?.description}
        <div class="text-error">
          {failureResopnse.description[0]}
        </div>
      {/if}
    </label>

    {#if edit}
      <TagSearch defaultSelectedTags={image.tags} />
      {#if failureResopnse?.tags}
        <div class="text-error">
          {failureResopnse.tags[0]}
        </div>
      {/if}
    {:else}
      <div
        class="flex p-2 gap-2 flex-wrap border rounded border-solid border-base-content min-h-fit items-center"
      >
        {#each image.tags as tag}
          <span
            class="bg-info text-info-content font-semibold px-3 rounded-full flex items-center gap-1"
          >
            {tag.title}
          </span>
        {/each}
      </div>
    {/if}
  </div>

  <div class="px-2 py-4 flex flex-col gap-2">
    {#if edit}
      <div>
        <Switch
          label="Use new image"
          id="use-current-iamge"
          onChange={state => {
            useNewImage = state;
            updatePreviewImage();
          }}
        />
      </div>
    {/if}
    <label class="" hidden={!edit || !useNewImage}>
      <div>
        Pick an image <span class="text-error" aria-label="required">
          *
        </span>
      </div>
      <div
        class="flex gap-2 rounded border border-solid border-base-content items-center"
      >
        <input
          bind:this={imageInputElement}
          class="grow"
          type="file"
          id="image"
          onchange={previewImage}
          accept=".png,.jpeg,.svg"
          required
          disabled={!edit || !useNewImage}
        />
        {#if newImageSrc !== ""}
          <button
            class="mx-1"
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

    {#if imageSrc !== ""}
      <img
        id="preview-selected-image"
        alt="preview"
        src={imageSrc}
      />
    {/if}
  </div>

  <button
    class="px-4 font-semibold active:scale-98 active:transition-all bg-primary text-primary-content py-2 rounded-full"
    type="submit"
    hidden={!edit}
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
