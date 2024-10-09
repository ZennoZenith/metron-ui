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
let alertClass: string = $state("");

switch (toast.toastType) {
  case "INFO":
    alertClass = "alert-info";
    break;
  case "SUCCESS":
    alertClass = "alert-success";
    break;
  case "WARNING":
    alertClass = "alert-warning";
    break;
  case "ERROR":
    alertClass = "alert-error";
    break;
}
</script>

<div class="alert {alertClass}" role="alert">
  {#if toast.toastType === "INFO"}
    <InfoSvg />
  {:else if toast.toastType === "SUCCESS"}
    <SuccessSvg />
  {:else if toast.toastType === "WARNING"}
    <WarningSvg />
  {:else if toast.toastType === "ERROR"}
    <ErrorSvg />
  {/if}
  <div class="">
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

<style></style>
