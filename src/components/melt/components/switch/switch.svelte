<script lang="ts">
import { cn, uuidv4 } from "$utils/helpers";
import { createSwitch, melt } from "@melt-ui/svelte";

type Props = {
  label?: string;
  id?: string;
  ariaLabelledby?: string;
  class?: string;
  name?: string;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  defaultChecked?: boolean;
  onChange?: (state: boolean) => void;
};
const {
  class: className = "",
  id = uuidv4(),
  ariaLabelledby,
  label = "",
  disabled = false,
  defaultChecked = false,
  name,
  value,
  required,
  onChange = () => {},
}: Props = $props();

const {
  elements: { root, input },
  states: { checked },
} = createSwitch({
  disabled,
  defaultChecked,
  name,
  value,
  required,
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
    class={cn("pr-4 leading-none {disabled ? 'bg-gray-500' : ''}", className)}
    for={id}
  >
    {#if disabled}
      <strike>
        {label}
      </strike>
    {:else}
      {label}
    {/if}
  </label>
  <button
    {id}
    use:melt={$root}
    class="relative h-6 cursor-default rounded-full {disabled ? 'bg-gray-500' : 'bg-warning'} transition-colors data-[state=checked]:bg-success"
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
