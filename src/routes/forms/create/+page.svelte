<script lang="ts">
import { Forms } from "$features/forms/components";

type Props = {
  disabled?: boolean;
};

const { disabled }: Props = $props();
</script>

<main class="max-w-2xl mx-auto">
  <Forms {disabled} />
</main>
