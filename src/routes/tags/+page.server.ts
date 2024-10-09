import { API_BASE_ROUTE } from "$lib";
import type { Tag } from "$lib/types";
import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

interface Err extends Record<string, any> {
  error: {
    title?: {
      message: string;
    };
  };
  data?: Tag;
}

interface Ok extends Partial<Err> {
  data: Tag;
}

export const actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get("title")?.toString().trim();

    if (!title) {
      return fail<Err>(422, {
        error: {
          title: {
            message: "Tag name undefined or empty",
          },
        },
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
      return fail<Err>(422, {
        error: {
          title: {
            message: `Tag "${title}" already exists`,
          },
        },
      });
    }

    return { data: body } as Ok;
  },
} satisfies Actions;
