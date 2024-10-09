<script lang="ts">
import { enhance } from "$app/forms";
import { toast } from "$lib/store/toast";
import type { ActionData } from "./$types";

export let form: ActionData;

$: (() => {
  // input is not actually used but present as a statement
  form;
  // console.log(
  //   `This function is running, current input is ${JSON.stringify(form)}`,
  // );
  if (!form) {
    return;
  }

  if (form.error?.title?.message) {
    toast.error(form.error.title.message);
  }
  if (form.data?.title) {
    const message = `Tag created with tag title: ${form.data.title}`;
    toast.success(message);
  }
})();

function resetError(key: string) {
  if (form?.error?.hasOwnProperty(key)) {
    form.error[key] = undefined;
  }
}
</script>

<form
  method="POST"
  action="?/create"
  use:enhance
  id="form"
  class="mx-auto max-w-screen-xl grid grid-cols-1 gap-4"
>
  <div class="px-2 py-4 flex flex-col gap-6">
    <label class="form-control">
      <div class="label">
        <span class="label-text">Title</span>
        <span class="label-text-alt">Custom syntax</span>
      </div>
      <input
        id="title"
        class="input input-bordered {form?.error?.title ? 'input-error': ''} w-full"
        required
        autocomplete="off"
        name="title"
        type="text"
        placeholder="Title"
        oninput={() => resetError("title")}
      />
      {#if form?.error}
        <div class="label">
          <span class="label-text text-error">
            {form?.error?.title?.message}
          </span>
        </div>
      {/if}
    </label>

    <button class="btn btn-primary rounded-lg" type="submit">
      Create tag
    </button>
  </div>
</form>

<style>
</style>
