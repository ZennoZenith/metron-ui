<script lang="ts">
import { flyAndScale } from "$components/melt/utils/index";
import { X } from "$icons";
import { createDialog, melt } from "@melt-ui/svelte";
import { fade } from "svelte/transition";

type Props = {
  title: string;
  content?: string;
  highlight?: string;
  closeOnYes?: boolean;
  onResponse?: (answer: boolean) => void;
};

const {
  title: dialogTitle,
  content: dialogContent = "",
  highlight = "",
  closeOnYes = true,
  onResponse = () => {},
}: Props = $props();

const {
  elements: {
    overlay,
    content,
    title,
    close,
    portalled,
    description,
  },
  states: { open },
} = createDialog({
  forceVisible: true,
  role: "alertdialog",
});

export function openDialog() {
  open.set(true);
}
</script>

{#if $open}
  <div class="" use:melt={$portalled}>
    <div
      use:melt={$overlay}
      class="fixed inset-0 z-50 bg-black/50"
      transition:fade={{ duration: 150 }}
    >
    </div>
    <div
      class="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[90vw] max-w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-base-content text-base-300 p-6 shadow-lg"
      transition:flyAndScale={{
        duration: 150,
        y: 8,
        start: 0.96,
      }}
      use:melt={$content}
    >
      <h2 use:melt={$title} class="m-0 text-lg font-medium">
        {dialogTitle}
      </h2>

      <p use:melt={$description} class="mb-5 mt-2 leading-normal text-zinc-600">
        {dialogContent}
        <span class="text-error">
          {highlight}
        </span>
      </p>

      <div class="w-full grid grid-cols-1 p-4">
        <div class="mt-6 flex justify-end gap-4">
          <button
            use:melt={$close}
            class="inline-flex h-8 items-center justify-center rounded-sm px-4 font-medium leading-none bg-neutral text-neutral-content"
            type="button"
            onclick={() => onResponse(false)}
          >
            Cancel
          </button>
          <button
            class="inline-flex h-8 items-center justify-center rounded-sm bg-error px-4 font-medium leading-none text-error-content"
            type="submit"
            onclick={() => {
              onResponse(true);
              if (closeOnYes) {
                open.set(false);
              }
            }}
          >
            Delete
          </button>
        </div>
        <button
          use:melt={$close}
          type="button"
          aria-label="close"
          class="absolute right-4 top-4 inline-flex h-6 w-6 appearance-none items-center justify-center rounded-full p-1 text-magnum-800 hover:bg-magnum-100 focus:shadow-magnum-400"
          onclick={() => onResponse(false)}
        >
          <X class="size-4" />
        </button>
      </div>
    </div>
  </div>
{/if}
