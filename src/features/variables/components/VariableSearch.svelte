<script lang="ts">
import { flyAndScale } from "$components/melt/utils/index";
import { IMAGE_BASE_ROUTE } from "$constants";
import { ConceptApiClient } from "$features/concepts/api";
import { searchEquation } from "$features/equations/api/client";
import { searchImage } from "$features/images/api/client";
import { ProblemApiClient } from "$features/problems/api";
import { MagnifyingGlass } from "$icons";
import { X } from "$icons";
import { getToaster } from "$lib/toaster.svelte";
import type { VariableType } from "$type/variables";
import { exhaustiveMatchingGuard } from "$utils/helpers";
import { createDialog, melt } from "@melt-ui/svelte";
import { fade } from "svelte/transition";

type Props = {
  onResponse?: (searchResult?: SearchResult) => void;
  variableType?: VariableType;
};

export interface SearchResult {
  id: string;
  value: string;
  title: string;
  description?: string | null;
  content?: string;
  imgSrc?: string;
}

const conceptClient = new ConceptApiClient();
const problemClient = new ProblemApiClient();

const toaster = getToaster();
const {
  onResponse = () => {},
  variableType,
}: Props = $props();

const {
  elements: {
    overlay,
    content,
    close,
    portalled,
  },
  states: { open },
} = createDialog({
  forceVisible: true,
  role: "dialog",
  defaultOpen: false,
});

let searchedResults = $state<SearchResult[]>([]);

export function setOpenState(state: boolean = true) {
  searchedResults = [];
  open.set(state);
}

async function searchImages(
  value: Record<string, unknown>,
): Promise<SearchResult[]> {
  const maybeImages = await searchImage(value);

  if (maybeImages.isErr()) {
    const error = maybeImages.unwrapErr();
    console.error(error);
    toaster.error(error.message);
    return [];
  }
  if (maybeImages.isOk()) {
    return maybeImages.unwrap().map(
      ({ id, description, title, fileLocation }) => {
        return {
          id,
          description,
          title,
          value: id,
          imgSrc: fileLocation.replace("file://", IMAGE_BASE_ROUTE),
        };
      },
    );
  }
  return [];
}

async function searchEquations(
  value: Record<string, unknown>,
): Promise<SearchResult[]> {
  const maybeEquations = await searchEquation(value);

  if (maybeEquations.isErr()) {
    const error = maybeEquations.unwrapErr();
    console.error(error);
    toaster.error(error.message);
    return [];
  }
  if (maybeEquations.isOk()) {
    return maybeEquations.unwrap().map(
      ({ id, description, title, content }) => {
        return {
          id,
          description,
          title,
          value: id,
          content,
        };
      },
    );
  }
  return [];
}

async function searchConcepts(
  value: Record<string, unknown>,
): Promise<SearchResult[]> {
  const maybeConcepts = await conceptClient.searchShortsByQueryTitle(value);

  if (maybeConcepts.isErr()) {
    const error = maybeConcepts.unwrapErr();
    console.error(error);
    toaster.error(error.message);
    return [];
  }
  if (maybeConcepts.isOk()) {
    return maybeConcepts.unwrap().map(
      ({ id, description, title }) => {
        return {
          id,
          description,
          title,
          value: id,
          content: "",
        };
      },
    );
  }
  return [];
}

async function searchProblems(
  value: Record<string, unknown>,
): Promise<SearchResult[]> {
  const maybeProblems = await problemClient
    .searchShortsByQueryTitle(value);

  if (maybeProblems.isErr()) {
    const error = maybeProblems.unwrapErr();
    console.error(error);
    toaster.error(error.message);
    return [];
  }
  if (maybeProblems.isOk()) {
    return maybeProblems.unwrap().map(
      ({ id, problemStatement, questionType }) => {
        return {
          id,
          description: questionType,
          title: problemStatement,
          value: id,
          content: "",
        };
      },
    );
  }
  return [];
}

async function onFormSubmit(
  event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement },
) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const formEntries = Object.fromEntries(formData.entries());
  // if (formEntries?.search.toString().trim().length === 0) return;

  if (!variableType) return;
  switch (variableType) {
    case "text":
      break;
    case "image":
      searchedResults = await searchImages(formEntries);
      break;
    case "equation":
      searchedResults = await searchEquations(formEntries);
      break;
    case "concept":
      searchedResults = await searchConcepts(formEntries);
      break;
    case "problem":
      searchedResults = await searchProblems(formEntries);
      break;
    default:
      exhaustiveMatchingGuard(variableType);
  }
}

let formRef = $state<HTMLFormElement>();
</script>

{#if $open}
  <div class="" use:melt={$portalled}>
    <div
      use:melt={$overlay}
      class="fixed inset-0 z-50 bg-black/50"
      transition:fade={{ duration: 150 }}
    >
    </div>
    <div
      class="fixed left-1/2 top-16 z-50 max-h-[85vh] w-[90vw] max-w-[90vw] -translate-x-1/2 -translate-y-1 rounded-xl bg-base-content text-base-300 p-6 shadow-lg"
      transition:flyAndScale={{
        duration: 150,
        y: 8,
        start: 0.96,
      }}
      use:melt={$content}
    >
      <div class="flex flex-col gap-2">
        <form
          bind:this={formRef}
          class="flex items-center gap-2 h-10 shrink"
          onsubmit={onFormSubmit}
        >
          <input
            class="inline-flex h-10 w-full flex-1 items-center justify-center rounded border border-solid border-accent px-3 leading-none"
            id="name"
            name="search"
            placeholder="Search {variableType}"
            required
            oninput={() => formRef?.requestSubmit()}
          />
          <button
            type="submit"
            class="bg-secondary text-secondary-content px-4 h-full rounded"
          >
            <MagnifyingGlass />
          </button>
        </form>
        <div class="grow overflow-y-auto max-h-[60vh]">
          {#each searchedResults as searchResult (searchResult.id)}
            <button
              class="mb-2 grid w-full gap-2 grid-cols-2 hover:bg-gray-400 focus:bg-gray-400"
              style="grid-template-columns: 9rem auto"
              onclick={() => {
                onResponse($state.snapshot(searchResult));
                open.set(false);
              }}
            >
              <div
                class="h-20 flex items-center content-center bg-gray-400 rounded-xl overflow-clip"
              >
                {#if variableType === "image"}
                  <img
                    class="max-h-full max-w-full mx-auto"
                    src={searchResult.imgSrc}
                    alt=""
                  >
                {:else if variableType !== undefined
    && ["equation", "problem", "content"].includes(variableType)}
                  <div class="w-full h-full text-center overflow-ellipsis">
                    {searchResult.content}
                  </div>
                {:else}
                  <div>No Data</div>
                {/if}
              </div>
              <div class="text-left">
                <div class="font-semibold overflow-clip">
                  {searchResult.title}
                </div>
                <div class="overflow-clip">
                  {searchResult.description}
                </div>
              </div>
            </button>
          {/each}
        </div>
      </div>

      <button
        use:melt={$close}
        type="button"
        aria-label="close"
        class="absolute right-2 top-2 inline-flex h-6 w-6 appearance-none items-center justify-center rounded-full p-1 text-magnum-800 hover:bg-magnum-100 focus:shadow-magnum-400"
        onclick={() => onResponse(undefined)}
      >
        <X class="size-4" />
      </button>
    </div>
  </div>
{/if}
