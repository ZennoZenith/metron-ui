<script lang="ts">
import ApiTest from "$components/api-test.svelte";
import ColorTest from "$components/colors-test.svelte";
</script>

<h1 class="text-3xl font-bold underline">
  Hello world!
</h1>
<ColorTest />
<ApiTest />

<style>
/* @import "tailwindcss/theme" reference;
:global(html) {
  background-color: theme(--color-gray-100);
} */
</style>
