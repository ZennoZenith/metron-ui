<script lang="ts">
import { flyAndScale } from "$components/melt/utils/index";
import { X } from "$icons";
import type { Tag } from "$type/tags";
import { createDialog, melt } from "@melt-ui/svelte";
import { fade } from "svelte/transition";
import type { UpdateIssues } from "../schemas/update";

type Props = {
  tag?: Tag;
  failureResopnse?: UpdateIssues & { message?: string };
  closeOnYes?: boolean;
  onResponse?: (answer: boolean) => void;
  onSubmit?: (newTitle: string) => void;
};

const {
  tag,
  failureResopnse,
  closeOnYes = true,
  onResponse = () => {},
  onSubmit = () => {},
}: Props = $props();
let newTitle = $state("");

const {
  elements: {
    overlay,
    content,
    title,
    close,
    portalled,
  },
  states: { open },
} = createDialog({
  forceVisible: true,
  role: "alertdialog",
});

export function setOpenState(state: boolean = true) {
  open.set(state);
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
        Update Tag
      </h2>

      <div class="w-full grid grid-cols-1 p-4">
        <fieldset class="mb-4 flex items-center gap-5">
          <label class="w-[90px] text-right" for="orignal-title">
            Orignal Title
          </label>
          <input
            class="inline-flex h-8 w-full flex-1 items-center justify-center rounded-sm border border-solid border-neutral px-3 leading-none"
            placeholder={tag ? tag.title : ""}
            value={tag ? tag.title : ""}
            disabled
            aria-disabled="true"
          />
        </fieldset>
        <fieldset class="mb-4 flex items-center gap-5">
          <label class="w-[90px] text-right" for="name"> Title </label>
          <input
            class="inline-flex h-8 w-full flex-1 items-center justify-center rounded-sm border border-solid border-neutral px-3 leading-none"
            placeholder="New tag title"
            bind:value={newTitle}
          />
          {#if failureResopnse?.title}
            <div class="text-error">
              {failureResopnse.title[0]}
            </div>
          {/if}
        </fieldset>
        {#if failureResopnse?.message}
          <div class="text-error">
            {failureResopnse.message}
          </div>
        {/if}
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
            class="inline-flex h-8 items-center justify-center rounded-sm bg-secondary px-4 font-medium leading-none text-secondary-content"
            type="submit"
            onclick={() => {
              onResponse(true);
              onSubmit($state.snapshot(newTitle));
              if (closeOnYes) {
                open.set(false);
              }
            }}
          >
            Save changes
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

<style>
fieldset {
  display: grid;
  gap: 0 1em;
  align-items: center;
  grid-template-columns: max-content auto;
  grid-template-rows: 2.5em 1em;

  div {
    grid-column-start: 2;
    font-size: smaller;
    overflow: hidden;
  }
}
</style>
