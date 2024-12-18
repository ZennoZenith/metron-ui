<script lang="ts">
import "../app.css";
import Toaster from "$components/Toaster.svelte";
import ToastTest from "$components/ToastTest.svelte";
import { setToaster } from "$lib/toaster.svelte";

let { children } = $props();
setToaster();
</script>

{@render children()}

<ToastTest />
<Toaster />
