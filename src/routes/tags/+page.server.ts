import { API_BASE_ROUTE, type InternalApiError, type Tag } from "$lib";
import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get("title")?.toString().trim();

    if (!title) {
      return fail(422, {
        error: {
          title: {
            message: "Tag name undefined or empty",
          },
        } satisfies InternalApiError,
      });
    }

    let res = await fetch(`${API_BASE_ROUTE}/tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });

    let body = await res.json() as Tag;

    if (res.status !== 200) {
      return fail(422, {
        error: {
          title: {
            message: `Tag "${title}" already exists`,
          },
        } satisfies InternalApiError,
      });
    }

    return { data: body };
  },
} satisfies Actions;
