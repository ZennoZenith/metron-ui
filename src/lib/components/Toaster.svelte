<script lang="ts">
import Toast from "$lib/components/Toast.svelte";
import { getToastState } from "$lib/toast-state.svelte";

const toastState = getToastState();
</script>

<div id="toast-container" class="toast toast-end">
  {#each toastState.toasts as toast (toast.id)}
    <Toast {toast} />
  {/each}
</div>

<style>
</style>
