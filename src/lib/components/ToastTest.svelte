<script lang="ts">
import { getToastState } from "$lib/toast-state.svelte";
import type { ToastType } from "$lib/types";

const toastState = getToastState();

function showToast(toastType: ToastType): any {
  switch (toastType) {
    case "INFO":
      toastState.info("Info title", "Info Message");
      break;
    case "SUCCESS":
      toastState.success("Success title", "Success Message");
      break;
    case "WARNING":
      toastState.warning("Warning title", "Warning Message");
      break;
    case "ERROR":
      toastState.error("Error title", "Error Message");
      break;
  }
}
</script>

<div class="flex flex-wrap gap-4">
  <button
    class="btn btn-primary rounded-lg"
    type="button"
    onclick={() => showToast("INFO")}
  >
    Add Info Toast
  </button>
  <button
    class="btn btn-primary rounded-lg"
    type="button"
    onclick={() => showToast("SUCCESS")}
  >
    Add Success Toast
  </button>
  <button
    class="btn btn-primary rounded-lg"
    type="button"
    onclick={() => showToast("WARNING")}
  >
    Add Warning Toast
  </button>
  <button
    class="btn btn-primary rounded-lg"
    type="button"
    onclick={() => showToast("ERROR")}
  >
    Add error Toast
  </button>
</div>
