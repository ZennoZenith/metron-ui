<script lang="ts">
import { applyAction, enhance } from "$app/forms";
import { goto, invalidateAll } from "$app/navigation";
import { flyAndScale } from "$components/melt/utils/index";
import {
  type CreateIssues,
  validateCreateSchema,
} from "$features/tags/schemas/create";
import { X } from "$icons";
import type { ErrorObject } from "$lib/error";
import { getToaster } from "$lib/toaster.svelte";
import { createDialog, melt } from "@melt-ui/svelte";
import { fade } from "svelte/transition";
import type { SubmitFunction } from "../$types";

const {
  elements: {
    trigger,
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

const toaster = getToaster();

// let successResponse = $state<Tag>();
let failureResopnse = $state<CreateIssues & { message?: string }>();

function setFailureResponse(error?: ErrorObject) {
  failureResopnse = {
    title: error?.type === "validation-error"
      ? error.extra?.title as [string, ...string[]]
      : undefined,
    message: error?.message,
  };
}

const submitTag: SubmitFunction = (
  { formData, formElement, cancel },
) => {
  const formEntries = Object.fromEntries(formData.entries());
  let parsed = validateCreateSchema(formEntries);

  if (parsed.isErr()) {
    setFailureResponse(parsed.err?.error);
    toaster.error("Invalid form data");
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
        // successResponse = result.data;
        toaster.success(
          `Tag created with name ${result.data?.title ?? title.toString()}`,
        );
        open.set(false);
        break;
      case "failure":
        setFailureResponse(result.data);
        toaster.error(result.data?.message ?? "");
        break;
    }
    // await update();
    await applyAction(result);
    await invalidateAll();
  };
};
</script>

<button
  use:melt={$trigger}
  class="px-4 font-semibold active:scale-98 active:transition-all bg-primary text-primary-content py-2 rounded-full"
  type="button"
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
      class="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[90vw] max-w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-base-content text-base-300 p-6 shadow-lg"
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

      <form
        method="POST"
        action="?/create"
        use:enhance={submitTag}
        id="form"
        class="w-full grid grid-cols-1 p-4"
      >
        <fieldset class="mb-4 flex items-center gap-5">
          <label class="w-[90px] text-right" for="name"> Title </label>
          <input
            class="inline-flex h-8 w-full flex-1 items-center justify-center rounded-sm border border-solid border-neutral px-3 leading-none"
            id="name"
            name="title"
            placeholder="Tag title"
            value=""
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
