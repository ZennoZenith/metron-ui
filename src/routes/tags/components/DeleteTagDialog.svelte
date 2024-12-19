<script lang="ts">
import { applyAction, enhance } from "$app/forms";
import { invalidateAll } from "$app/navigation";
import { flyAndScale } from "$components/melt/utils/index";
import { X } from "$icons";
import { getToaster } from "$lib/toaster.svelte";
import { type Tag } from "$type/tags";
import { UuidSchema } from "$utils/uuid";
import { createDialog, melt } from "@melt-ui/svelte";
import { fade } from "svelte/transition";
import { safeParse } from "valibot";
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

const deleteTag: SubmitFunction = (
  { formData, formElement, cancel },
) => {
  const { id } = Object.fromEntries(formData.entries());

  let parsed = safeParse(UuidSchema, id);

  if (!parsed.success) {
    toaster.error(parsed.issues[0].message);
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
        toaster.success(
          "Tag deleted successfully",
        );
        open.set(false);
        break;
      case "failure":
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
        Delete Tag
      </h2>

      <p use:melt={$description} class="mb-5 mt-2 leading-normal text-zinc-600">
        This action cannot be undone. This will permanently delete the tag:
        <span class="text-error">
          {tag?.title}
        </span>
      </p>

      <form
        method="POST"
        action="?/delete"
        use:enhance={deleteTag}
        id="form"
        class="w-full grid grid-cols-1 p-4"
      >
        <input
          name="id"
          class="inline-flex h-8 w-full flex-1 items-center justify-center rounded-sm border border-solid border-neutral px-3 leading-none"
          value={tag ? tag.id : ""}
          type="hidden"
          aria-disabled="true"
        />
        <div class="mt-6 flex justify-end gap-4">
          <button
            use:melt={$close}
            class="inline-flex h-8 items-center justify-center rounded-sm px-4 font-medium leading-none bg-neutral text-neutral-content"
            type="button"
          >
            Cancel
          </button>
          <button
            class="inline-flex h-8 items-center justify-center rounded-sm bg-error px-4 font-medium leading-none text-error-content"
            type="submit"
          >
            Delete
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
