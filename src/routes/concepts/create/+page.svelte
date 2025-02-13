<script lang="ts">
import { ConceptApiClient } from "$features/concepts/api";
import Concept from "$features/concepts/components/Concept.svelte";
import { getToaster } from "$lib/toaster.svelte";
import { type InternalVariables } from "$schemas/internal-variable.svelte";
import { setEmptyStringAsNullish } from "$utils/helpers";

const toaster = getToaster();
const conceptClient = new ConceptApiClient();
let reset = $state(false);

async function onSubmit(
  id: string,
  title: string,
  description: string,
  content: string,
  tags: string,
  equations: string,
  images: string,
  concepts: string,
  internalVariables: InternalVariables,
): Promise<void> {
  const variables = internalVariables.toVariables();

  const result = await conceptClient.create({
    id,
    title,
    description: setEmptyStringAsNullish(description),
    content,
    tags,
    equations,
    images,
    concepts,
    variables,
  });

  if (result.isErr()) {
    toaster.error(
      result.unwrapErr().message ?? "Internal Server Error",
    );
    return;
  }

  if (result.isOk()) {
    toaster.success("Concept saved");
    resetForm();
  }
}

function resetForm() {
  reset = !reset;
}
</script>

{#key reset}
  <Concept {onSubmit} />
{/key}
