<script lang="ts">
import { IMAGE_BASE_ROUTE } from "$constants";
import { Edit, ExternalLink, Trash } from "$icons";
import type { Image } from "$type/images";

type Props = {
  image: Image;
  onClickDelete?: (image: Image) => void;
  // onClickUpdate?: (id: string) => void;
};

const { image, onClickDelete = () => {} }: Props = $props();
</script>

<div class="rounded-xl bg-base-200 flex flex-col">
  <div class="h-60 p-2">
    <img
      class="h-full mx-auto"
      src={image.fileLocation.replace("file://", IMAGE_BASE_ROUTE)}
      alt=""
    >
  </div>
  <div class="p-2 bg-base-300 rounded-b-xl flex-1 flex flex-col">
    <a
      class="font-bold text-xl mb-1 flex items-center gap-2"
      href="/images/{image.id}"
      target="_blank"
    >
      {image.title} <ExternalLink />
    </a>
    <div class="flex gap-2">
      {#each image.tags as tag}
        <div class="bg-info text-info-content font-semibold rounded-full px-4">
          {tag.title}
        </div>
      {/each}
    </div>
    <div class="flex-1">{image.description}</div>
    <div>{new Date(image.createdAt).toLocaleString()}</div>
    <div class="flex justify-between">
      <a href="/images/{image.id}?edit=true" target="_blank">
        <button
          class="flex gap-2 items-center bg-warning text-warning-content rounded-full px-4 py-1"
        >
          Edit <Edit />
        </button>
      </a>
      <button
        class="flex gap-2 items-center bg-error text-error-content rounded-full px-4 py-1"
        onclick={() => onClickDelete(image)}
      >
        Delete <Trash />
      </button>
    </div>
  </div>
</div>
