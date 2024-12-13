<script lang="ts">
import Toast from "$lib/components/Toast.svelte";
import { getToastState } from "$lib/toast-state.svelte";

const toastState = getToastState();
</script>

<div
  id="toast-container"
  class="fixed flex flex-col gap-2 bottom-0 right-0 p-2 z-30"
>
  {#each toastState.toasts as toast (toast.id)}
    <Toast {toast} />
  {/each}
</div>

<style>
</style>
