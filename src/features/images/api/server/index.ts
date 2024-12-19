import { API_BASE_ROUTE } from "$constants";
import type { CreateSchema } from "$features/images/models/create";
import type { ApiError, FetchError } from "$lib/error";
import { Ok, type Result } from "$lib/superposition";
import { fetchEmpty } from "$utils";

/**
 * Call from serverside only
 */
export async function createImage(
  image: CreateSchema,
): Promise<Result<{}, FetchError | ApiError>> {
  const newFormData = new FormData();
  newFormData.append("image", image.image);
  newFormData.append("title", image.title);
  if (image.description) newFormData.append("description", image.description);
  if (image.tags) newFormData.append("tags", image.tags);

  let errorOrJson = await fetchEmpty(`${API_BASE_ROUTE}/images`, {
    method: "POST",
    body: newFormData,
  });

  if (errorOrJson.err) {
    return errorOrJson as Result<never, typeof errorOrJson.err>;
  }

  return Ok({}) as Result<{}, never>;
}
