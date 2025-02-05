<script lang="ts">
import { goto, invalidateAll, replaceState } from "$app/navigation";
import { page } from "$app/state";
import ConformationDialog from "$components/ConformationDialog.svelte";
import { ProblemApiClient } from "$features/problems/api";
import Problem from "$features/problems/components/Problem.svelte";
import type { VariantUpdate } from "$features/variants/schemas/update";
import { Edit, Trash } from "$icons";
import { getToaster } from "$lib/toaster.svelte";
import type { InternalProblem } from "$schemas/internal-problem.svelte";
import type { InternalVariables } from "$schemas/internal-variable.svelte";
import { InternalVariants } from "$schemas/internal-variant.svelte";
import type { Variable, VariableType } from "$schemas/variable";
import type { PageData } from "./$types";

const toaster = getToaster();
const problemClient = new ProblemApiClient();

let deleteConformationDialog = $state<ConformationDialog>();

const { data }: { data: PageData } = $props();
const { problem: defaultProblem } = data;
let edit = $state(data.edit);

async function onDeleteResponse(answer: boolean) {
  if (!answer) return;

  const response = await problemClient.deleteProblemById(defaultProblem.id);

  if (response.isErr()) {
    const err = response.unwrapErr();
    toaster.error(err?.message ?? "");
    console.error(err);
    return;
  }

  toaster.success(
    `Problem deleted successfully redirecting to /problems in 5sec`,
  );
  setTimeout(() => goto("/problems"), 5000);
}

async function onSubmit(
  internalProblem: InternalProblem,
  internalVariables: InternalVariables,
  internalVariants: InternalVariants,
) {
  const variables = internalVariables.toVariables();

  const variants = internalVariants.toVariants();

  const {
    id,
    problemStatement,
    hint,
    questionType,
    tags,
    explanation,
  } = internalProblem.toProblem();

  const equations = variables
    .filter(v =>
      v.typ === "equation" && v.defaultValue !== undefined
      && v.defaultValue !== null
    ).map(v => v.defaultValue as string)
    .concat(extractVariableValueFromVariants("equation", variables, variants));

  const images = variables.filter(v =>
    v.typ === "image" && v.defaultValue !== undefined
    && v.defaultValue !== null
  ).map(v => v.defaultValue as string)
    .concat(extractVariableValueFromVariants("image", variables, variants));

  const concepts = variables
    .filter(v =>
      v.typ === "concept" && v.defaultValue !== undefined
      && v.defaultValue !== null
    ).map(v => v.defaultValue as string)
    .concat(extractVariableValueFromVariants("concept", variables, variants));

  const problems = variables
    .filter(v =>
      v.typ === "problem" && v.defaultValue !== undefined
      && v.defaultValue !== null
    ).map(v => v.defaultValue as string)
    .concat(extractVariableValueFromVariants("problem", variables, variants));

  const result = await problemClient.updateProblem({
    id,
    problemStatement,
    hint,
    questionType,
    tags,
    equations: equations.join(","),
    images: images.join(","),
    concepts: concepts.join(","),
    problems: problems.join(","),
    variables,
    variants,
    explanation,
  });

  if (result.err) {
    toaster.error(
      result.unwrapErr().message ?? "Internal Server Error",
    );
    const errorObj = result.unwrapErr().error;
    console.error(errorObj);
    // setFailureResponse(errorObj);
    return;
  }

  if (result.isOk()) {
    edit = false;
    toaster.success("Problem updated, refresh to get updated data");
    invalidateAll();
    replaceState(
      page.url.toString().replaceAll("edit=true", ""),
      {},
    );
  }
}
function extractVariableValueFromVariants(
  variableType: VariableType,
  variables: Variable[],
  variants: VariantUpdate[],
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
</script>

<ConformationDialog
  bind:this={deleteConformationDialog}
  title="Delete Problem "
  content="Are you sure you want to delete problem"
  onResponse={answer => onDeleteResponse(answer)}
/>

<div class="flex justify-between">
  <button
    class="flex gap-2 items-center bg-warning text-warning-content rounded-full px-4 py-1"
    onclick={() => edit = !edit}
  >
    {#if edit}
      Cancel Edit
    {:else}
      Edit
    {/if}
    <Edit />
  </button>
  {#if !edit}
    <button
      class="flex gap-2 items-center bg-error text-error-content rounded-full px-4 py-1"
      onclick={() => deleteConformationDialog?.setOpenState()}
    >
      Delete
      <Trash />
    </button>
  {/if}
</div>

<Problem {onSubmit} {defaultProblem} disabled={!edit} />
