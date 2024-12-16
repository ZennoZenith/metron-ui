<script lang="ts">
import { X } from "$icons";
import ErrorSvg from "$lib/svgs/error.svelte";
import InfoSvg from "$lib/svgs/info.svelte";
import SuccessSvg from "$lib/svgs/success.svelte";
import WarningSvg from "$lib/svgs/warning.svelte";
import { getToaster } from "$lib/toaster.svelte";
import type { Toast } from "$lib/types";
import { onMount } from "svelte";
import { fade, fly } from "svelte/transition";
type Props = {
  toast: Toast;
};

const MAX_PERCENTAGE_VALUE = 100;
const { toast }: Props = $props();
const toaster = getToaster();
let toastTypeClass: string = $state("");
let toastTypeTextClass: string = $state("");
let percentage = $state(0);

switch (toast.toastType) {
  case "INFO":
    toastTypeClass = "bg-info text-info-content";
    toastTypeTextClass = "text-info";
    break;
  case "SUCCESS":
    toastTypeClass = "bg-success text-success-content";
    toastTypeTextClass = "text-success";
    break;
  case "WARNING":
    toastTypeClass = "bg-warning text-warning-content";
    toastTypeTextClass = "text-warning";
    break;
  case "ERROR":
    toastTypeClass = "bg-error text-error-content";
    toastTypeTextClass = "text-error";
    break;
}

function setIfEmptyTitle(toast: Toast) {
  let title = "";
  switch (toast.toastType) {
    case "INFO":
      title = "Info";
      break;
    case "SUCCESS":
      title = "Success";
      break;
    case "WARNING":
      title = "Warning";
      break;
    case "ERROR":
      title = "Error";
      break;
  }

  if (!toast.title) return title;
  if (toast.title.trim().length === 0) return title;

  return toast.title;
}

onMount(() => {
  let frame: number;
  const updatePercentage = () => {
    percentage = toaster.getPercentage(toast.id);
    frame = requestAnimationFrame(updatePercentage);
  };
  frame = requestAnimationFrame(updatePercentage);
  return () => cancelAnimationFrame(frame);
});
</script>

<div
  class="toast relative rounded-lg shadow-md bg-base-300 text-base-content"
  role="alert"
  in:fly={{ duration: 150, x: "100%" }}
  out:fly={{ duration: 150, x: "100%" }}
  onmouseenter={() => toaster.pause(toast.id)}
  onmouseleave={() => toaster.resume(toast.id)}
>
  <div class="absolute left-5 top-2 h-1 w-[10%] overflow-hidden rounded-full">
    <div
      class="h-full w-full bg-magnum-500"
      style={`transform: translateX(-${
        (100 * (percentage ?? 0)) / (MAX_PERCENTAGE_VALUE ?? 1)
      }%)`}
    >
    </div>
  </div>
  {#if toast.pause.paused === true}
    <div
      class="absolute left-17 top-0.5 text-xs font-semibold text-magnum-500"
      transition:fade={{ duration: 100 }}
    >
      Paused
    </div>
  {/if}
  <div
    class="relative flex w-[24rem] max-w-[calc(100vw-2rem)] items-center justify-between gap-4 p-5 pt-6"
  >
    <div>
      <h3 class="flex items-center gap-2 font-semibold">
        <div class={toastTypeTextClass}>
          {#if toast.toastType === "INFO"}
            <InfoSvg />
          {:else if toast.toastType === "SUCCESS"}
            <SuccessSvg />
          {:else if toast.toastType === "WARNING"}
            <WarningSvg />
          {:else if toast.toastType === "ERROR"}
            <ErrorSvg />
          {/if}
        </div>
        {setIfEmptyTitle(toast)}
        <span class="size-1.5 rounded-full {toastTypeClass}"></span>
      </h3>
      <div>
        {toast.message}
      </div>
    </div>
    <button
      class="absolute right-4 top-4 grid size-6 place-items-center rounded-full text-magnum-500 hover:bg-magnum-900/50"
      aria-label="close toast"
      onclick={() => toaster.remove(toast.id)}
    >
      <X class="size-4" />
    </button>
  </div>
</div>
