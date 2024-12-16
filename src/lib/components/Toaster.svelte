<script lang="ts">
import Toast from "$lib/components/Toast.svelte";
import { getToastState } from "$lib/toast-state.svelte";
import { flip } from "svelte/animate";

const toastState = getToastState();
</script>

<div
  id="toast-container"
  class="fixed right-0 top-0 z-50 m-4 flex flex-col items-end gap-2 md:bottom-0 md:top-auto"
>
  {#each toastState.toasts as toast (toast.id)}
    <div animate:flip={{ duration: 500 }}>
      <Toast {toast} />
    </div>
  {/each}
</div>

<style>
</style>
