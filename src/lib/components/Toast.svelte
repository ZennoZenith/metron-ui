<script lang="ts">
import ErrorSvg from "$lib/svgs/error.svelte";
import InfoSvg from "$lib/svgs/info.svelte";
import SuccessSvg from "$lib/svgs/success.svelte";
import WarningSvg from "$lib/svgs/warning.svelte";
import { getToastState } from "$lib/toast-state.svelte";

import type { Toast } from "$lib/types";
type Props = {
  toast: Toast;
};

const { toast }: Props = $props();
const toastState = getToastState();
let toastTypeClass: string = $state("");

switch (toast.toastType) {
  case "INFO":
    toastTypeClass = "bg-info text-info-content";
    break;
  case "SUCCESS":
    toastTypeClass = "bg-success text-success-content";
    break;
  case "WARNING":
    toastTypeClass = "bg-warning text-warning-content";
    break;
  case "ERROR":
    toastTypeClass = "bg-error text-error-content";
    break;
}
</script>

<div
  class="{toastTypeClass} rounded h-20 flex justify-center items-center gap-4 p-2"
  role="alert"
>
  {#if toast.toastType === "INFO"}
    <InfoSvg />
  {:else if toast.toastType === "SUCCESS"}
    <SuccessSvg />
  {:else if toast.toastType === "WARNING"}
    <WarningSvg />
  {:else if toast.toastType === "ERROR"}
    <ErrorSvg />
  {/if}
  <div class="flex-grow">
    {#if toast.title}
      <div class="">{toast.title}</div>
    {/if}

    <div class="">{toast.message}</div>
  </div>
  <button
    class="w-4 h-4 flex content-center items-center text-2xl"
    aria-label="close toast"
    onclick={() => toastState.remove(toast.id)}
  >
    <!-- <span class=""> Close toast </span> -->
    &times;
  </button>
</div>
