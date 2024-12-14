<script lang="ts">
import { cn } from "$lib/utils";
import type { Snippet } from "svelte";

type Props = {
  children?: Snippet;
  class?: string | null;
  onclick?: (
    event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
  ) => void;
  type?: HTMLButtonElement["type"];
};
const { children, class: className, type = "button", ...restProps }: Props =
  $props();
</script>
<button
  class={cn(
    "px-4 font-semibold active:scale-98 active:transition-all",
    className,
  )}
  {type}
  {...restProps}
>
  {#if children}
    {@render children?.()}
  {:else}
    Button
  {/if}
</button>
