import { API_BASE_ROUTE, type Tag } from "$lib";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async (event) => {
  const jsonBody = await event.request.json();

  const tagName = jsonBody.tagName?.toString()?.trim();

  if (!tagName) {
    return json([]);
  }

  const payload = new URLSearchParams();
  payload.append("tagName", tagName);
  let data = await fetch(`${API_BASE_ROUTE}/tags?${payload.toString()}`)
    .then(d => d.json()) as Tag[];

  return json(data);
};
