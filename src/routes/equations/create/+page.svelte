<script lang="ts">
import { EquationApiClient } from "$features/equations/api";
import Equation from "$features/equations/components/Equation.svelte";
import { getToaster } from "$lib/toaster.svelte";
import { setEmptyStringAsNullish } from "$utils/helpers";

const toaster = getToaster();
const equationClient = new EquationApiClient();
let reset = $state(false);

async function onSubmit(
  id: string,
  title: string,
  description: string,
  content: string,
  tags: string,
): Promise<void> {
  const result = await equationClient.create({
    id,
    title,
    description: setEmptyStringAsNullish(description),
    content,
    tags,
  });

  if (result.isErr()) {
    toaster.error(
      result.unwrapErr().message ?? "Internal Server Error",
    );
    return;
  }

  if (result.isOk()) {
    toaster.success("Equation saved");
    resetForm();
  }
}

function resetForm() {
  reset = !reset;
}
</script>

{#key reset}
  <Equation {onSubmit} />
{/key}
