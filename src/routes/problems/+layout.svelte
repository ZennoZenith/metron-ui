<script lang="ts">
let { children } = $props();
</script>

<svelte:head>
  <title>Problem</title>
</svelte:head>

<main class="px-2 pt-10">
  {@render children()}
</main>
