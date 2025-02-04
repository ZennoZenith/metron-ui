<script lang="ts">
import { page } from "$app/state";
</script>

<h1>{page.status}: {JSON.stringify(page.error, null, 2)}</h1>
