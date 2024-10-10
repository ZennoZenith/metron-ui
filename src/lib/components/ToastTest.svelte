<script lang="ts">
import { getToastState } from "$lib/toast-state.svelte";
import type { ToastType } from "$lib/types";

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
