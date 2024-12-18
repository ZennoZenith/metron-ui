import { API_BASE_ROUTE } from "$constants";
import type { CreateSchema } from "$features/tags/models/create";
import type { UpdateSchema } from "$features/tags/models/update";
import { FetchError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import type { Tag } from "$type/tags";
import { fetchJson } from "$utils";
import type { Uuid } from "$utils/uuid";

export async function createTag(tag: CreateSchema) {
  let errorOrJson = await fetchJson<Tag>(`${API_BASE_ROUTE}/tags`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tag),
  });

  // return errorOrJson;
  if (errorOrJson.success) {
    return Ok(errorOrJson.data);
  }
  // return Err(errorOrJson.error);
  return Err(new FetchError(errorOrJson.error));
}

export async function updateTag(tag: UpdateSchema) {
  let errorOrJson = await fetchJson<Tag>(`${API_BASE_ROUTE}/tags/id/${tag.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: tag.title }),
  });

  return errorOrJson;
}

export async function deleteTag(id: Uuid) {
  let errorOrJson = await fetchJson<Tag>(`${API_BASE_ROUTE}/tags/id/${id}`, {
    method: "DELETE",
  });

  return errorOrJson;
}

export async function searchTagByQueryTitle(query: string) {
  const url = new URL(`${API_BASE_ROUTE}/tags`);
  url.searchParams.append("tagName", query);
  let errorOrJson = await fetchJson<Tag[]>(url);

  return errorOrJson;
}
