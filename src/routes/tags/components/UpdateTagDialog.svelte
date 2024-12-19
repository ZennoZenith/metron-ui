<script lang="ts">
import { applyAction, enhance } from "$app/forms";
import { invalidateAll } from "$app/navigation";
import { flyAndScale } from "$components/melt/utils/index";
import { validateUpdateSchema } from "$features/tags/models/update";
import { X } from "$icons";
import type { ErrorObject } from "$lib/error";
import { isErr } from "$lib/superposition";
import { getToaster } from "$lib/toaster.svelte";
import type { Tag } from "$type/tags";
import { createDialog, melt } from "@melt-ui/svelte";
import { fade } from "svelte/transition";
import type { SubmitFunction } from "../$types";

type Props = { tag?: Tag };

const { tag }: Props = $props();

const toaster = getToaster();
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

export function openDialog() {
  open.set(true);
}

let successResponse = $state<Tag>();
let failureResopnse = $state<ErrorObject>();

const updateTag: SubmitFunction = (
  { formData, formElement, cancel },
) => {
  const formEntries = Object.fromEntries(formData.entries());
  let parsed = validateUpdateSchema(formEntries);

  if (isErr(parsed)) {
    failureResopnse = parsed.err;
    console.error(parsed);
    toaster.error("Invalid form data");
    cancel();
    return;
  }

  return async ({ result }) => {
    switch (result.type) {
      case "error":
        toaster.error(result.error);
        break;
      case "success":
        formElement.reset();
        successResponse = result.data;
        toaster.success(
          "Tag updated",
        );
        open.set(false);
        break;
      case "failure":
        failureResopnse = result.data;
        toaster.error(result.data?.message ?? "");
        break;
    }
    // await update();
    await applyAction(result);
    await invalidateAll();
  };
};
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

      <form
        method="POST"
        action="?/update"
        use:enhance={updateTag}
        id="form"
        class="w-full grid grid-cols-1 p-4"
      >
        <fieldset class="mb-4 flex items-center gap-5">
          <label class="w-[90px] text-right" for="orignal-title">
            Orignal Title
          </label>
          <input
            id="orignal-title"
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
            name="id"
            hidden
            aria-hidden="true"
            value={tag ? tag.id : ""}
          />
          <input
            class="inline-flex h-8 w-full flex-1 items-center justify-center rounded-sm border border-solid border-neutral px-3 leading-none"
            id="name"
            name="title"
            placeholder="New tag title"
            value={tag ? tag.title : ""}
          />
          {#if response?.success === false && response.error.type === "VALIDATION"
    && response.error.data.title}
            <div class="text-error">
              {response.error.data.title[0]}
            </div>
          {/if}
        </fieldset>
        {#if response?.success === false}
          <div class="text-error">
            {response.error.messages[0]}
          </div>
        {/if}
        <div class="mt-6 flex justify-end gap-4">
          <button
            use:melt={$close}
            class="inline-flex h-8 items-center justify-center rounded-sm px-4 font-medium leading-none bg-neutral text-neutral-content"
            type="button"
          >
            Cancel
          </button>
          <button
            class="inline-flex h-8 items-center justify-center rounded-sm bg-secondary px-4 font-medium leading-none text-secondary-content"
            type="submit"
          >
            Save changes
          </button>
        </div>
        <button
          use:melt={$close}
          type="button"
          aria-label="close"
          class="absolute right-4 top-4 inline-flex h-6 w-6 appearance-none items-center justify-center rounded-full p-1 text-magnum-800 hover:bg-magnum-100 focus:shadow-magnum-400"
        >
          <X class="size-4" />
        </button>
      </form>
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
