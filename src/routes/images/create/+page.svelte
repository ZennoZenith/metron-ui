<script lang="ts">
import { ImageApiClient } from "$features/images/api";
import Image from "$features/images/components/Image.svelte";
import type { UpdateSchema } from "$features/images/schemas/update";
import { getToaster } from "$lib/toaster.svelte";
import { setEmptyStringAsNullish } from "$utils/helpers";

const toaster = getToaster();
const imageClient = new ImageApiClient();
let reset = $state(false);

function resetForm() {
  reset = !reset;
}

async function onSubmit(data: UpdateSchema): Promise<void> {
  const result = await imageClient.create({
    title: data.title,
    imageType: data.imageType,
    description: setEmptyStringAsNullish(data.description),
    tags: data.tags,
    image: data.image,
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
    toaster.success("Image saved");
    resetForm();
  }
}
</script>

<Image {onSubmit} />
