<script lang="ts">
import TagSearch from "$components/TagSearch.svelte";
import Variables from "$features/variables/components/Variables.svelte";
import {
  InternalVariables,
  setInternalVariablesContext,
} from "$schemas/internal-variable.svelte";

import type { Concept } from "$type/concepts";
import { exhaustiveMatchingGuard } from "$utils/helpers";

type Props = {
  defaultConcept?: Concept;
  disabled?: boolean;
  onSubmit?: (
    id: string,
    title: string,
    description: string,
    content: string,
    tags: string,
    equations: string,
    images: string,
    concepts: string,
    variables: InternalVariables,
  ) => void;
};

const { defaultConcept, disabled = false, onSubmit = () => {} }: Props =
  $props();
const VARIABLE_KEY = Symbol("VARIABLE");

const internalVariables = setInternalVariablesContext(
  VARIABLE_KEY,
  addLabelToVariable(defaultConcept),
);

let conceptId = $state(defaultConcept?.id ?? "");
let title = $state(defaultConcept?.title ?? "");
let description = $state(defaultConcept?.description ?? "");
let content = $state(defaultConcept?.content ?? "");
let tags = $state(defaultConcept?.tags.map(v => v.id).join(",") ?? "");

function addLabelToVariable(concept?: Concept) {
  if (!concept) return undefined;

  return concept.variables.map(variable => {
    const label = extractLabel(
      variable,
      concept.equations,
      concept.images,
      concept.concepts,
    );

    return {
      ...variable,
      value: variable.defaultValue,
      label,
    };
  });
}

function extractLabel(
  variable: Concept["variables"][number],
  equations: Concept["equations"],
  images: Concept["images"],
  concepts: Concept["concepts"],
) {
  switch (variable.typ) {
    case "text":
      return variable.defaultValue;
    case "image":
      return images.find(v => v.id === variable.defaultValue)?.title;
    case "equation":
      return equations.find(v => v.id === variable.defaultValue)?.title;
    case "concept":
      return concepts.find(v => v.id === variable.defaultValue)?.title;
    case "problem":
      return "";
    default:
      exhaustiveMatchingGuard(variable.typ);
  }
}
</script>

<form
  onsubmit={event => {
    if (disabled) return;
    event.preventDefault();
    onSubmit(
      conceptId,
      title,
      description,
      content,
      tags,
      internalVariables.internalVariables
        .filter(v => v.typ === "equation")
        .map(v => v.value)
        .join(","),
      internalVariables.internalVariables
        .filter(v => v.typ === "image")
        .map(v => v.value)
        .join(","),
      internalVariables.internalVariables
        .filter(v => v.typ === "concept")
        .map(v => v.value)
        .join(","),
      internalVariables,
    );
  }}
  class="mx-auto grid grid-cols-1 gap-4"
>
  <input type="hidden" name="id" value={conceptId}>
  <label>
    <div>
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

  <TagSearch
    defaultSelectedTags={defaultConcept?.tags}
    onChange={value => tags = value}
    {disabled}
  />

  <Variables
    variablesContextKey={VARIABLE_KEY}
    allowedValues={["image", "equation", "concept"]}
    disableNullable
    {disabled}
  />

  {#if !disabled}
    <button
      class="px-4 font-semibold active:scale-98 active:transition-all bg-primary text-primary-content py-2 rounded-full"
      type="submit"
    >
      Submit
    </button>
  {/if}
</form>
