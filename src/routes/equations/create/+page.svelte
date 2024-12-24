<script lang="ts">
import { applyAction, enhance } from "$app/forms";
import { goto, invalidateAll } from "$app/navigation";
import TagSearch from "$components/TagSearch.svelte";
import {
  type CreateIssues,
  validateCreateSchema,
} from "$features/equations/models/create";
import type { ErrorObject } from "$lib/error";
import { getToaster } from "$lib/toaster.svelte";
import type { SubmitFunction } from "../$types";

let tagSearchRef = $state<TagSearch>();
const toaster = getToaster();
let failureResopnse = $state<CreateIssues & { message?: string }>();

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

const submitEquation: SubmitFunction = (
  { formData, cancel },
) => {
  if (formData.get("description")?.toString().trim() === "") {
    formData.delete("description");
  }
  if (formData.get("tags")?.toString().trim() === "") {
    formData.delete("tags");
  }
  if (formData.get("content")?.toString().trim() === "") {
    formData.delete("content");
  }

  const formEntries = Object.fromEntries(formData.entries());
  let parsed = validateCreateSchema(formEntries);

  if (parsed.isErr()) {
    setFailureResponse(parsed.err?.error);
    toaster.error("Invalid form data");
    cancel();
    return;
  }

  return async ({ result, formElement }) => {
    switch (result.type) {
      case "redirect":
        goto(result.location);
        break;
      case "error":
        toaster.error(result.error.message ?? "Internal Server Error");
        break;
      case "success":
        formElement.reset();
        tagSearchRef?.clearSelectedTags();
        toaster.success("Equation saved");
        break;
      case "failure":
        setFailureResponse(result.data);
        toaster.error(result.data?.message ?? "");
        break;
    }

    await applyAction(result);
    await invalidateAll();
  };
};
</script>

<form
  id="form"
  method="POST"
  action="/equations?/create"
  use:enhance={submitEquation}
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
        class="w-full text-xl h-12 min-h-12 p-2 rounded border border-solid border-base-content"
        placeholder=""
        name="title"
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
      ></textarea>
      {#if failureResopnse?.description}
        <div class="text-error">
          {failureResopnse.description[0]}
        </div>
      {/if}
    </label>

    <TagSearch bind:this={tagSearchRef} />
    {#if failureResopnse?.tags}
      <div class="text-error">
        {failureResopnse.tags[0]}
      </div>
    {/if}
  </div>
  <div class="px-2 py-4 flex flex-col gap-6">
    <label class="">
      <div class="label">
        Content <span class="text-error" aria-label="required"> * </span>
      </div>
      <textarea
        id="content"
        class="w-full text-xl min-h-12 h-96 p-2 rounded border border-solid border-base-content"
        placeholder=""
        name="content"
        required
      ></textarea>
      {#if failureResopnse?.content}
        <div class="text-error">
          {failureResopnse.content[0]}
        </div>
      {/if}
    </label>
  </div>

  <button
    class="px-4 font-semibold active:scale-98 active:transition-all bg-primary text-primary-content py-2 rounded-full"
    type="submit"
  >
    Submit
  </button>
</form>
