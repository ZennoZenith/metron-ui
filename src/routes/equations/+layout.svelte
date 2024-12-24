<script lang="ts">
let { children } = $props();
</script>

<svelte:head>
  <title>Equation form</title>
</svelte:head>

<main class="px-2 pt-10">
  {@render children()}
</main>
