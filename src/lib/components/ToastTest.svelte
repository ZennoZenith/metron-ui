<script lang="ts">
import { getToastState } from "$lib/toast-state.svelte";
import type { ToastType } from "$lib/types";
import { Button } from "./melt";

const toastState = getToastState();

function showToast(toastType: ToastType): any {
  switch (toastType) {
    case "INFO":
      toastState.info("Info Message", "Info title");
      break;
    case "SUCCESS":
      toastState.success("Success Message", "Success title");
      break;
    case "WARNING":
      toastState.warning("Warning Message", "Warning title");
      break;
    case "ERROR":
      toastState.error("Error Message", "Error title");
      break;
  }
}
</script>

<div class="flex flex-wrap gap-4 p-4">
  <Button
    class="rounded-full text-info-content bg-info hover:bg-info/95"
    onclick={() => showToast("INFO")}
  >
    Add Info Toast
  </Button>
  <Button
    class="rounded-full text-success-content bg-success hover:bg-success/95"
    onclick={() => showToast("SUCCESS")}
  >
    Add Success Toast
  </Button>
  <Button
    class="rounded-full text-warning-content bg-warning hover:bg-warning/95"
    onclick={() => showToast("WARNING")}
  >
    Add Warning Toast
  </Button>
  <Button
    class="rounded-full text-error-content bg-error hover:bg-error/95"
    onclick={() => showToast("ERROR")}
  >
    Add error Toast
  </Button>
</div>
