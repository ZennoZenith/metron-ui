<script>
import "../app.css";
import "../base.css";
import Toaster from "$lib/components/Toaster.svelte";
import ToastTest from "$lib/components/ToastTest.svelte";
import { setToastState } from "$lib/toast-state.svelte";

setToastState();
</script>

<slot />

<ToastTest />
<Toaster />
