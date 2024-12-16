<script lang="ts">
import "../app.css";
import Toaster from "$lib/components/Toaster.svelte";
import ToastTest from "$lib/components/ToastTest.svelte";
import { setToaster } from "$lib/toaster.svelte";

let { children } = $props();
setToaster();
</script>

{@render children()}

<ToastTest />
<Toaster />
