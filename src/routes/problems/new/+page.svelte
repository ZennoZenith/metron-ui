<script lang="ts">
import Problem from "$features/problems/components/Problem.svelte";
import { type PageData } from "./$types";

const { data }: { data: PageData } = $props();
const { problem } = data;
</script>
<Problem defaultProblem={problem} />
