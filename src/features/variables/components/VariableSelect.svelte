<script lang="ts">
import { Check, ChevronDown } from "$icons/index.js";
import {
  VARIABLE_TYPES,
  type VariableType,
  type VariableTypeLoose,
} from "$schemas/variable.svelte";
import { createSelect, melt } from "@melt-ui/svelte";
import { fade } from "svelte/transition";
import VariableValue from "./VariableValue.svelte";

type Props = {
  name?: string;
  disabled?: boolean;
  required?: boolean;
  defaultValue?: VariableTypeLoose;
  allowedValues?: VariableTypeLoose[];
  onChange?: (value: VariableType) => void;
};

const {
  disabled = false,
  name,
  required,
  defaultValue,
  allowedValues = structuredClone(VARIABLE_TYPES),
  onChange = () => {},
}: Props = $props();

interface Variable {
  value: VariableTypeLoose;
  label: string;
  disabled: boolean;
}

const options: Variable[] = [
  { value: "text", label: "Text", disabled: false },
  { value: "image", label: "Image", disabled: false },
  { value: "equation", label: "Equation", disabled: false },
  { value: "concept", label: "Concept", disabled: false },
  { value: "problem", label: "Problem", disabled: false },
].filter(v => allowedValues.includes(v.value));

const {
  elements: { trigger, menu, option },
  states: { selectedLabel, open },
  helpers: { isSelected },
} = createSelect<string>({
  forceVisible: true,
  positioning: {
    placement: "bottom",
    fitViewport: true,
    sameWidth: true,
  },
  name,
  disabled,
  required,
  defaultSelected: options.find(value => value.value === defaultValue),
  onSelectedChange: (state) => {
    if (!(VARIABLE_TYPES as string[]).includes(state.next?.value ?? "")) {
      onChange("text");
    } else {
      onChange(state.next?.value as VariableType ?? "text");
    }
    return state.next;
  },
});
</script>

<div class="flex flex-col gap-1">
  <button
    class="flex h-10 items-center justify-between rounded-lg bg-base-300 text-surface-content hover:bg-base-100 px-3 py-2 shadow transition-opacity hover:opacity-90"
    use:melt={$trigger}
    aria-label="Food"
    type="button"
  >
    {$selectedLabel || "Select variable type*"} <ChevronDown class="size-5" />
  </button>
  {#if $open}
    <div
      class="z-10 flex max-h-[300px] flex-col overflow-y-auto rounded-lg bg-base-200 p-1 shadow focus:!ring-0"
      use:melt={$menu}
      transition:fade={{ duration: 150 }}
    >
      {#each options as item}
        <div
          class="relative cursor-pointer rounded-lg py-1 pl-8 pr-4 bg-base-300 text-surface-content hover:bg-base-100 focus:z-10 focus:text-magnum-700 data-[highlighted]:bg-zinc-700 data-[highlighted]:text-surface-content data-[disabled]:opacity-50"
          use:melt={$option({ value: item.value, label: item.label })}
        >
          <div class="check {$isSelected(item.value) ? 'block' : 'hidden'}">
            <Check class="size-6" />
          </div>
          {item.label}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
.check {
  position: absolute;
  left: 0.5rem;
  top: 50%;
  translate: 0 calc(-50% + 1px);
}
</style>
