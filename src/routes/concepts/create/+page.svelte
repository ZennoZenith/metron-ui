<script lang="ts">
import TagSearch from "$components/TagSearch.svelte";
import { createConcept } from "$features/concepts/api/client";
import { type CreateIssues } from "$features/concepts/schemas/create";
import Variables from "$features/variables/components/Variables.svelte";
import type { ErrorObject } from "$lib/error";
import { getToaster } from "$lib/toaster.svelte";

let tagSearchRef = $state<TagSearch>();
let variablesRef = $state<Variables>();
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

function resetForm(formElement: HTMLFormElement) {
  formElement.reset();
  tagSearchRef?.clearSelectedTags();
  variablesRef?.clearVariables();
}

async function onFormSubmit(
  event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement },
) {
  event.preventDefault();
  // Taking reference because current element becomes null for some reason down in function
  const formElement = event.currentTarget;
  const formData = new FormData(formElement);

  const title = formData.get("title")?.toString() ?? "";
  const description = formData.get("description")?.toString() ?? "";
  const content = formData.get("content")?.toString() ?? "";
  const tags = tagSearchRef?.getTagIdStrings() ?? "";

  const variables = variablesRef?.getVariables();
  if (variables === undefined) {
    toaster.error("Variable ref not set");
    return;
  }

  const images = variables.filter(v => v.typ === "image").map(v =>
    v.defaultValue
  ).join(",");

  const equations = variables.filter(v => v.typ === "equation").map(v =>
    v.defaultValue
  )
    .join(",");

  const concepts = variables.filter(v => v.typ === "concept").map(v =>
    v.defaultValue
  )
    .join(",");

  const maybeConcepts = await createConcept({
    title,
    description: description.trim().length === 0 ? null : description,
    content,
    equations,
    tags,
    images,
    concepts,
    variables,
  });

  if (maybeConcepts.err) {
    toaster.error(
      maybeConcepts.unwrapErr().message ?? "Internal Server Error",
    );
    const errorObj = maybeConcepts.unwrapErr().error;
    console.error(errorObj);
    setFailureResponse(errorObj);
    return;
  }

  if (maybeConcepts.isOk()) {
    toaster.success("Concept saved");
    resetForm(formElement);
  }
}
</script>

<form
  onsubmit={onFormSubmit}
  class="mx-auto grid grid-cols-1 gap-4"
>
  <label>
    <div>
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

  <label>
    <div>
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

  <label>
    <div>
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

  <TagSearch bind:this={tagSearchRef} />
  {#if failureResopnse?.tags}
    <div class="text-error">
      {failureResopnse.tags[0]}
    </div>
  {/if}

  <Variables
    bind:this={variablesRef}
    allowedVariableTypes={["image", "equation"]}
    disableNullable
  />

  <button
    class="px-4 font-semibold active:scale-98 active:transition-all bg-primary text-primary-content py-2 rounded-full"
    type="submit"
  >
    Submit
  </button>
</form>
