import { API_BASE_ROUTE } from "$constants";
import type { ParsedTagCreate, ParsedTagUpdate, Tag } from "$lib/models/tags";
import type { Uuid } from "$types";
import { fetchJson } from "$utils";

export async function createTag(tag: ParsedTagCreate) {
  let errorOrJson = await fetchJson<Tag>(`${API_BASE_ROUTE}/tags`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tag),
  });

  return errorOrJson;
}

export async function updateTag(tag: ParsedTagUpdate) {
  let errorOrJson = await fetchJson<Tag>(`${API_BASE_ROUTE}/tags/id/${tag.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: tag.title }),
  });

  return errorOrJson;
}

export async function searchTagByQueryTitle(query: string) {
  const url = new URL(`${API_BASE_ROUTE}/tags`);
  url.searchParams.append("tagName", query);
  let errorOrJson = await fetchJson<Tag[]>(url);

  return errorOrJson;
}
