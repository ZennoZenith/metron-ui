<script lang="ts">
import type { ActionData, SubmitFunction } from "./$types";
import CreateTagDialog from "./CreateTagDialog.svelte";

// let { form }: { form: ActionData } = $props();
</script>

<div class="grid grid-cols-1 p-4">
  <CreateTagDialog />
</div>

<!-- 
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

 -->
