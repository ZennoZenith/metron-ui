<script lang="ts">
import { cn } from "$utils/helpers";
import { createSwitch, melt } from "@melt-ui/svelte";

type Props = {
  label: string;
  id: string;
  ariaLabelledby?: string;
  class?: string;
  disabled?: boolean;
  onChange?: (state: boolean) => void;
};
const {
  class: className = "",
  id,
  ariaLabelledby,
  label,
  disabled = false,
  onChange = () => {},
}: Props = $props();

const {
  elements: { root, input },
  states: { checked },
} = createSwitch({
  disabled,
  onCheckedChange: ({ next }) => {
    onChange(next);
    return next;
  },
});

export function setState(state: boolean) {
  checked.set(state);
}
</script>

<div class="flex items-center">
  <label
    class={cn("pr-4 leading-none", className)}
    for={id}
  >
    {label}
  </label>
  <button
    {id}
    use:melt={$root}
    class="relative h-6 cursor-default rounded-full bg-warning transition-colors data-[state=checked]:bg-success"
    aria-labelledby={ariaLabelledby}
  >
    <span class="thumb block rounded-full bg-white transition"></span>
  </button>
  <input use:melt={$input} />
</div>

<style>
button {
  --w: 2.75rem;
  --padding: 0.125rem;
  width: var(--w);
}

.thumb {
  --size: 1.25rem;
  width: var(--size);
  height: var(--size);
  transform: translateX(var(--padding));
}

:global([data-state="checked"]) .thumb {
  transform: translateX(calc(var(--w) - var(--size) - var(--padding)));
}
</style>
