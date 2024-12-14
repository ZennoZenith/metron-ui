<script lang="ts">
import { createDialog, melt } from "@melt-ui/svelte";
/** Internal helpers */
import { X } from "$icons";
import { flyAndScale } from "$lib/melt/utils/index";
import { fade } from "svelte/transition";

const {
  elements: {
    trigger,
    overlay,
    content,
    title,
    description,
    close,
    portalled,
  },
  states: { open },
} = createDialog({
  forceVisible: true,
});
</script>

<button
  use:melt={$trigger}
  class="px-4 font-semibold active:scale-98 active:transition-all bg-primary text-primary-content py-2 rounded-full"
>
  Create tag
</button>

{#if $open}
  <div class="" use:melt={$portalled}>
    <div
      use:melt={$overlay}
      class="fixed inset-0 z-50 bg-black/50"
      transition:fade={{ duration: 150 }}
    >
    </div>
    <div
      class="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[90vw] max-w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-base-300 text-base-content p-6 shadow-lg"
      transition:flyAndScale={{
        duration: 150,
        y: 8,
        start: 0.96,
      }}
      use:melt={$content}
    >
      <h2 use:melt={$title} class="m-0 text-lg font-medium">
        Create Tag
      </h2>

      <fieldset class="mb-4 flex items-center gap-5">
        <label class="w-[90px] text-right" for="name"> Title </label>
        <input
          class="inline-flex h-8 w-full flex-1 items-center justify-center rounded-sm border border-solid border-neutral px-3 leading-none"
          id="name"
          name="title"
          placeholder="Tag title"
          value=""
        />
      </fieldset>
      <div class="mt-6 flex justify-end gap-4">
        <button
          use:melt={$close}
          class="inline-flex h-8 items-center justify-center rounded-sm px-4 font-medium leading-none bg-neutral text-neutral-content"
        >
          Cancel
        </button>
        <button
          use:melt={$close}
          class="inline-flex h-8 items-center justify-center rounded-sm bg-primary px-4 font-medium leading-none text-primary-content"
        >
          Save changes
        </button>
      </div>
      <button
        use:melt={$close}
        aria-label="close"
        class="absolute right-4 top-4 inline-flex h-6 w-6 appearance-none items-center justify-center rounded-full p-1 text-default-content hover:bg-accent focus:shadow-accent"
      >
        <X class="size-4" />
      </button>
    </div>
  </div>
{/if}
