<script lang="ts">
import ProblemApiClient from "$features/problems/api";
import Problem from "$features/problems/components/Problem.svelte";
import type { VariantUpdate } from "$features/variants/schemas/update";
import { getToaster } from "$lib/toaster.svelte";
import type { InternalProblem } from "$schemas/internal-problem.svelte";
import type { InternalVariables } from "$schemas/internal-variable.svelte";
import { InternalVariants } from "$schemas/internal-variant.svelte";
import type { Variable, VariableType } from "$schemas/variable";

const toaster = getToaster();
const problemClient = new ProblemApiClient();
let reset = $state(false);

async function onSubmit(
  internalProblem: InternalProblem,
  internalVariables: InternalVariables,
  internalVariants: InternalVariants,
) {
  const variables = internalVariables.toVariables();

  const variants = internalVariants.toVariants();

  const {
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

  // console.log({
  //   problemStatement,
  //   hint,
  //   questionType,
  //   tags,
  //   equations: equations.join(","),
  //   images: images.join(","),
  //   concepts: concepts.join(","),
  //   problems: problems.join(","),
  //   variables,
  //   variants,
  //   explanation,
  // });

  const result = await problemClient.createProblem({
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
    toaster.success("Problem saved");
    resetForm();
  }
}

function resetForm() {
  reset = !reset;
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

{#key reset}
  <Problem {onSubmit} />
{/key}
