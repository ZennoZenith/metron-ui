// place files you want to import through the `$lib` alias in this folder.
export const API_BASE_ROUTE = "http://localhost:8081/api";

export function uuidv4() {
  if (window?.isSecureContext) {
    return crypto.randomUUID();
  }

  return "10000000-1000-4000-8000-100000000000".replace(
    /[018]/g,
    c => (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16),
  );
}

export { default as Debounce } from "./debounce";
export { default as Searchable } from "./searchable.svelte";
