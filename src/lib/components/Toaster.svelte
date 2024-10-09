<script lang="ts">
import { type Toast } from "$lib";
import { toast } from "$lib/store/toast";

let toasting: Toast[];
toast.subcribe();
</script>

<div id="toast-container" class="toast toast-end"></div>

<style>
</style>
