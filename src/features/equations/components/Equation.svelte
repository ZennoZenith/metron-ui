<script lang="ts">
import TagSearch from "$components/TagSearch.svelte";
import type { Equation } from "$type/equations";

type Props = {
  defaultEquation?: Equation;
  disabled?: boolean;
  onSubmit?: (
    id: string,
    title: string,
    description: string,
    content: string,
    tags: string,
  ) => void;
};

const { defaultEquation, disabled = false, onSubmit = () => {} }: Props =
  $props();

let equationId = $state(defaultEquation?.id ?? "");
let title = $state(defaultEquation?.title ?? "");
let description = $state(defaultEquation?.description ?? "");
let content = $state(defaultEquation?.content ?? "");
let tags = $state(defaultEquation?.tags.map(v => v.id).join(",") ?? "");
</script>

<form
  onsubmit={event => {
    if (disabled) return;
    event.preventDefault();
    onSubmit(
      equationId,
      title,
      description,
      content,
      tags,
    );
  }}
  class="mx-auto max-w-(--breakpoint-xl) grid sm:grid-cols-1 xl:grid-cols-2 gap-4"
>
  <input type="hidden" name="id" value={equationId}>
  <div class="px-2 py-4 flex flex-col gap-6">
    <label class="">
      <div class="">
        Title <span class="text-error" aria-label="required"> * </span>
      </div>
      <textarea
        class="w-full text-xl h-12 min-h-12 p-2 rounded border border-solid border-base-content"
        placeholder=""
        name="title"
        required
        bind:value={title}
        {disabled}
      ></textarea>
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
        bind:value={description}
        {disabled}
      ></textarea>
    </label>

    {#if !disabled}
      <TagSearch
        defaultSelectedTags={defaultEquation?.tags}
        onChange={value => tags = value}
      />
    {:else if defaultEquation}
      <div
        class="flex p-2 gap-2 flex-wrap border rounded border-solid border-base-content min-h-fit items-center"
      >
        {#each defaultEquation.tags as tag}
          <span
            class="bg-info text-info-content font-semibold px-3 rounded-full flex items-center gap-1"
          >
            {tag.title}
          </span>
        {/each}
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
        bind:value={content}
        required
        {disabled}
      ></textarea>
    </label>
  </div>

  {#if !disabled}
    <button
      class="px-4 font-semibold active:scale-98 active:transition-all bg-primary text-primary-content py-2 rounded-full"
      type="submit"
    >
      Submit
    </button>
  {/if}
</form>
