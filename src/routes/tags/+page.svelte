<script lang="ts">
import { applyAction, enhance } from "$app/forms";
import { invalidateAll } from "$app/navigation";
import { getToastState } from "$lib/toast-state.svelte";
import type { ActionData, SubmitFunction } from "./$types";

let { form }: { form: ActionData } = $props();

const toastState = getToastState();
let titleInput = $state<HTMLInputElement>();

const submitTag: SubmitFunction = (
  { formData, formElement, cancel },
) => {
  const { title } = Object.fromEntries(formData);
  if (title.toString().length < 1) {
    toastState.error("Tag name undefined or empty");
    cancel();
  }

  return async ({ result }) => {
    let message = "";
    switch (result.type) {
      case "redirect":
        break;
      case "error":
        toastState.error(result.error);
        break;
      case "success":
        formElement.reset();
        message = `Tag created with name ${
          result.data?.data.title ?? title.toString()
        }`;
        toastState.success(message);
        break;
      case "failure":
        message = result.data?.error.title?.message ?? "";
        toastState.error(message);
        break;
    }
    // await update();
    await applyAction(result);
    await invalidateAll();
    titleInput?.focus();
  };
};

function resetError(key: "title") {
  if (form?.error?.hasOwnProperty(key)) {
    form.error[key] = undefined;
  }
}
</script>

<form
  method="POST"
  action="?/create"
  use:enhance={submitTag}
  id="form"
  class=""
>
  <div class="px-2 py-4 flex flex-col gap-6">
    <label class="">
      <div class="">
        <span class="">Title</span>
        <span class="">Required</span>
      </div>
      <input
        id="title"
        class=""
        autocomplete="off"
        name="title"
        type="text"
        placeholder="Title"
        required
        bind:this={titleInput}
        oninput={() => resetError("title")}
      />
      {#if form?.error}
        <div class="">
          <span class="">
            {form?.error?.title?.message}
          </span>
        </div>
      {/if}
    </label>

    <button class="" type="submit">
      Create tag
    </button>
  </div>
</form>
<style>
</style>
