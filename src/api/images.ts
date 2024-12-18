import { API_BASE_ROUTE } from "$constants";
import type { CreateSchema } from "$features/images/models/create";
import { fetchEmpty } from "$utils";

export async function createImage(image: CreateSchema) {
  const newFormData = new FormData();
  newFormData.append("image", image.image);
  newFormData.append("title", image.title);
  if (image.description) newFormData.append("description", image.description);
  if (image.tags) newFormData.append("tags", image.tags);

  let errorOrJson = await fetchEmpty(`${API_BASE_ROUTE}/images`, {
    method: "POST",
    body: newFormData,
  });

  return errorOrJson;
}

// export async function updateTag(tag: ParsedTagUpdate) {
//   let errorOrJson = await fetchJson<Tag>(`${API_BASE_ROUTE}/tags/id/${tag.id}`, {
//     method: "PATCH",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ title: tag.title }),
//   });

//   return errorOrJson;
// }

// export async function deleteTag(id: Uuid) {
//   let errorOrJson = await fetchJson<Tag>(`${API_BASE_ROUTE}/tags/id/${id}`, {
//     method: "DELETE",
//   });

//   return errorOrJson;
// }

// export async function searchTagByQueryTitle(query: string) {
//   const url = new URL(`${API_BASE_ROUTE}/tags`);
//   url.searchParams.append("tagName", query);
//   let errorOrJson = await fetchJson<Tag[]>(url);

//   return errorOrJson;
// }
