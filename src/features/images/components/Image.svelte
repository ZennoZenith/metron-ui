<script lang="ts">
import TagSearch from "$components/TagSearch.svelte";
import type { Image } from "$type/images";

type Props = {
  defaultImage?: Image;
  disabled?: boolean;
  onSubmit?: (image: UpdateSchema) => void;
};
import { Switch } from "$components/melt";
import { IMAGE_BASE_ROUTE } from "$constants";
import { X } from "$icons";
import { base64ToFile, imageSrcToBase64 } from "$utils/imageConversion";
import { MimeTypes } from "$utils/mime";
import { onMount } from "svelte";
import { fade } from "svelte/transition";
import type { UpdateSchema } from "../schemas/update";

const { defaultImage, disabled = false, onSubmit = () => {} }: Props = $props();

let imageId = $state(defaultImage?.id ?? "");
let title = $state(defaultImage?.title ?? "");
let description = $state(defaultImage?.description ?? "");
let tags = $state(defaultImage?.tags.map(v => v.id).join(",") ?? "");

let imageType = $state(
  MimeTypes.get(defaultImage?.imageType.toLowerCase()) ?? "",
);
let imageInputElement = $state<HTMLInputElement>();
let useNewImage = $state(defaultImage ? false : true);

let defaultImageType = MimeTypes
  .get(defaultImage?.imageType.toLowerCase()) ?? "";
let defaultImageSrcBase64: string = "";
let defaultImageFile: File | undefined = undefined;

let newImageSrcBase64 = $state("");
let newImageType = $state("");
let newImageFile = $state<File>();

let imageSrcBase64: string = $state(defaultImageSrcBase64);
let imageFile: File | undefined = $state(defaultImageFile);

function updatePreviewImage() {
  if (useNewImage) {
    imageSrcBase64 = newImageSrcBase64;
    imageType = newImageType;
    imageFile = newImageFile;
  } else {
    imageSrcBase64 = defaultImageSrcBase64;
    imageType = defaultImageType;
    imageFile = defaultImageFile;
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
    newImageSrcBase64 = src;
    newImageFile = file;
    newImageType = file.type;
  } else {
    newImageSrcBase64 = "";
    newImageType = "";
    newImageFile = undefined;
  }
  updatePreviewImage();
}

function removeImage() {
  newImageSrcBase64 = "";
  newImageType = "";
  newImageFile = undefined;
  updatePreviewImage();
  if (imageInputElement) {
    imageInputElement.value = "";
  }
}

onMount(async () => {
  if (!defaultImage || !defaultImageType) return;

  defaultImageSrcBase64 = await imageSrcToBase64(
    defaultImage.fileLocation.replace("file://", IMAGE_BASE_ROUTE),
    imageType,
  );
  defaultImageFile = base64ToFile(
    defaultImageSrcBase64,
    "current",
    defaultImageType,
  );
  imageSrcBase64 = defaultImageSrcBase64;
  imageFile = defaultImageFile;
});

function onFormSubmit(
  event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement },
) {
  if (disabled) return;
  event.preventDefault();
  onSubmit({
    id: imageId,
    imageType: imageType as UpdateSchema["imageType"],
    title: $state.snapshot(title),
    description: $state.snapshot(description),
    tags,
    image: imageFile!,
  });
}
</script>

<form
  onsubmit={onFormSubmit}
  enctype="multipart/form-data"
  class="mx-auto max-w-(--breakpoint-xl) grid sm:grid-cols-1 xl:grid-cols-2 gap-4"
>
  <input type="hidden" name="id" value={imageId}>
  <div class="px-2 py-4 flex flex-col gap-6">
    <label>
      <div>
        Title <span class="text-error" aria-label="required"> * </span>
      </div>
      <textarea
        class="w-full text-xl h-12 min-h-12 p-2 rounded border border-solid border-base-content"
        placeholder=""
        name="title"
        required
        bind:value={title}
        {disabled}
      ></textarea>
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
        bind:value={description}
        {disabled}
      ></textarea>
    </label>

    {#if !disabled}
      <TagSearch
        defaultSelectedTags={defaultImage?.tags}
        onChange={value => tags = value}
      />
    {:else if defaultImage}
      <div
        class="flex p-2 gap-2 flex-wrap border rounded border-solid border-base-content min-h-fit items-center"
      >
        {#each defaultImage.tags as tag}
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
    {#if !disabled && defaultImage}
      <div>
        <Switch
          defaultChecked={useNewImage}
          label="Use new image"
          onChange={state => {
            useNewImage = state;
            updatePreviewImage();
          }}
        />
      </div>
    {/if}
    <label class="" hidden={disabled || !useNewImage}>
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
          disabled={disabled || !useNewImage}
        />
        {#if newImageSrcBase64 !== ""}
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
    </label>

    <input type="hidden" name="imageType" value={imageType}>

    {#if imageSrcBase64 !== ""}
      <img
        id="preview-selected-image"
        alt="preview"
        src={imageSrcBase64}
      />
    {/if}
  </div>

  <button
    class="px-4 font-semibold active:scale-98 active:transition-all bg-primary text-primary-content py-2 rounded-full"
    type="submit"
    hidden={disabled}
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
