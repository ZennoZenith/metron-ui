<script lang="ts">
import TagSearch from "$components/TagSearch.svelte";
import { createProblem } from "$features/problems/api/client";
import QuestionTypeSelect from "$features/problems/components/QuestionTypeSelect.svelte";
import { type CreateIssues } from "$features/problems/schemas/create";
import Variables from "$features/variables/components/Variables.svelte";
import Variants from "$features/variants/components/Variants.svelte";
import type { ErrorObject } from "$lib/error";
import { getToaster } from "$lib/toaster.svelte";
import { VARIABLE_TYPES } from "$schemas/variable";
import type { VariantCreate } from "$schemas/variant";
import type { Variable, VariableType } from "$type/variables";

let tagSearchRef = $state<TagSearch>();
let variablesRef = $state<Variables>();
let variantsRef = $state<Variants>();
let questionTypeRef = $state<QuestionTypeSelect>();

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

function extractVariableValueFromVariants(
  variableType: VariableType,
  variables: Variable[],
  variants: VariantCreate[],
) {
  const variableNames = variables
    .filter(v => v.typ === variableType)
    .map(v => v.name);
  const ret: string[] = [];
  for (const variant of variants) {
    for (const variableValue of variant.variableValues) {
      if (variableNames.includes(variableValue.name)) {
        ret.push(variableValue.value);
      }
    }
  }
  return ret;
}

async function onFormSubmit(
  event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement },
) {
  event.preventDefault();
  // Taking reference because current element becomes null for some reason down in function
  const formElement = event.currentTarget;
  const formData = new FormData(formElement);

  const variables = variablesRef?.getVariables();
  if (variables === undefined) {
    toaster.error("Variable ref not set");
    return;
  }

  const problemStatement = formData.get("problemStatement")?.toString() ?? "";
  const hint = formData.get("hint")?.toString() ?? "";
  const explanation = formData.get("explanation")?.toString() ?? "";
  const questionType = questionTypeRef?.getSelectedVariable() ?? "";
  const tags = tagSearchRef?.getTagIdStrings() ?? "";
  const variants = variantsRef?.getVariants();
  let equations = variables
    .filter(v =>
      v.typ === "equation" && v.defaultValue !== undefined
      && v.defaultValue !== null
    ).map(v => v.defaultValue as string);
  let images = variables.filter(v =>
    v.typ === "image" && v.defaultValue !== undefined
    && v.defaultValue !== null
  ).map(v => v.defaultValue as string);
  let concepts = variables
    .filter(v =>
      v.typ === "concept" && v.defaultValue !== undefined
      && v.defaultValue !== null
    ).map(v => v.defaultValue as string);
  let problems = variables
    .filter(v =>
      v.typ === "problem" && v.defaultValue !== undefined
      && v.defaultValue !== null
    ).map(v => v.defaultValue as string);

  if (variants && variables) {
    equations = equations.concat(
      extractVariableValueFromVariants("equation", variables, variants),
    );
    images = images.concat(
      extractVariableValueFromVariants("image", variables, variants),
    );
    concepts = concepts.concat(
      extractVariableValueFromVariants("concept", variables, variants),
    );
    problems = problems.concat(
      extractVariableValueFromVariants("problem", variables, variants),
    );
  }

  console.log({
    problemStatement,
    hint: hint.trim().length === 0 ? null : hint,
    questionType,
    tags,
    equations: equations.join(","),
    images: images.join(","),
    concepts: concepts.join(","),
    problems: problems.join(","),
    variables,
    variants,
    explanation: explanation.trim().length === 0 ? null : explanation,
  });

  const maybeProblems = await createProblem({
    problemStatement,
    hint: hint.trim().length === 0 ? null : hint,
    questionType,
    tags,
    equations: equations.join(","),
    images: images.join(","),
    concepts: concepts.join(","),
    problems: problems.join(","),
    variables,
    variants,
    explanation: explanation.trim().length === 0 ? null : explanation,
  });

  if (maybeProblems.err) {
    toaster.error(
      maybeProblems.unwrapErr().message ?? "Internal Server Error",
    );
    const errorObj = maybeProblems.unwrapErr().error;
    console.error(errorObj);
    setFailureResponse(errorObj);
    return;
  }

  if (maybeProblems.isOk()) {
    toaster.success("Problem saved");
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
      Problem Statement
      <span class="text-error" aria-label="required"> * </span>
    </div>
    <textarea
      class="w-full text-xl h-36 min-h-12 p-2 rounded border border-solid border-base-content"
      placeholder=""
      name="problemStatement"
      required
    ></textarea>
    {#if failureResopnse?.problemStatement}
      <div class="text-error">
        {failureResopnse.problemStatement[0]}
      </div>
    {/if}
  </label>

  <label>
    <div>
      Hint <span aria-label="optional"></span>
    </div>
    <textarea
      class="w-full text-xl h-12 min-h-12 p-2 rounded border border-solid border-base-content"
      placeholder=""
      name="hint"
    ></textarea>
    {#if failureResopnse?.hint}
      <div class="text-error">
        {failureResopnse.hint[0]}
      </div>
    {/if}
  </label>

  <QuestionTypeSelect bind:this={questionTypeRef} name="questionType" />

  <TagSearch bind:this={tagSearchRef} />
  {#if failureResopnse?.tags}
    <div class="text-error">
      {failureResopnse.tags[0]}
    </div>
  {/if}

  <label>
    <div>
      Explanation <span aria-label="optional"></span>
    </div>
    <textarea
      class="w-full text-xl min-h-12 h-52 p-2 rounded border border-solid border-base-content"
      placeholder=""
      name="explanation"
    ></textarea>
    {#if failureResopnse?.explanation}
      <div class="text-error">
        {failureResopnse.explanation[0]}
      </div>
    {/if}
  </label>

  <Variables
    bind:this={variablesRef}
    allowedValues={structuredClone(VARIABLE_TYPES)}
  />

  <Variants bind:this={variantsRef} variables={variablesRef?.getVariables()} />

  <button
    class="px-4 font-semibold active:scale-98 active:transition-all bg-primary text-primary-content py-2 rounded-full"
    type="submit"
  >
    Submit
  </button>
</form>
