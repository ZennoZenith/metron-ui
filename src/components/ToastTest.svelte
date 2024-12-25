<script lang="ts">
import { getToaster } from "$lib/toaster.svelte";
import type { ToastType } from "$type";

const toaster = getToaster();

function showToast(toastType: ToastType) {
  switch (toastType) {
    case "INFO":
      toaster.info("Info Message", "Info title");
      break;
    case "SUCCESS":
      toaster.success("Success Message", "Success title");
      break;
    case "WARNING":
      toaster.warning("Warning Message", "Warning title");
      break;
    case "ERROR":
      toaster.error("Error Message", "Error title");
      break;
  }
}
</script>

<div class="flex flex-wrap gap-4 p-4">
  <button
    class="px-4 font-semibold active:scale-98 active:transition-all rounded-full text-info-content bg-info hover:bg-info/95"
    onclick={() => showToast("INFO")}
  >
    Add Info Toast
  </button>
  <button
    class="px-4 font-semibold active:scale-98 active:transition-all rounded-full text-success-content bg-success hover:bg-success/95"
    onclick={() => showToast("SUCCESS")}
  >
    Add Success Toast
  </button>
  <button
    class="px-4 font-semibold active:scale-98 active:transition-all rounded-full text-warning-content bg-warning hover:bg-warning/95"
    onclick={() => showToast("WARNING")}
  >
    Add Warning Toast
  </button>
  <button
    class="px-4 font-semibold active:scale-98 active:transition-all rounded-full text-error-content bg-error hover:bg-error/95"
    onclick={() => showToast("ERROR")}
  >
    Add error Toast
  </button>
</div>
