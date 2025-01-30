<script lang="ts">
import {
  InternalVariable,
  type VariableValue as VariableValueType,
} from "$schemas/variable.svelte";
import { uniqByKeepLast } from "$utils";
import { Debounce } from "$utils/debounce";
import { untrack } from "svelte";
import VariableValue from "./VariableValue.svelte";

interface Props {
  internalVariables: InternalVariable[];
}

const { internalVariables }: Props = $props();

const debounce = new Debounce();

const requiredVariables = $derived(
  internalVariables.filter(v => v.required === true),
);
const optionalVariables = $derived(
  internalVariables.filter(v => v.required === false),
);

let requiredVariableValues = $state<VariableValueType[]>([]);
let optionalVariableValues = $state<VariableValueType[]>([]);
$effect(() => {
  internalVariables;
  untrack(() => {
    const temp1 = requiredVariables.map(v => {
      return {
        name: v.name,
        value: "",
      } satisfies VariableValueType as VariableValueType;
    });
    const temp2 = optionalVariables.map(v => {
      return {
        name: v.name,
        value: "",
      } satisfies VariableValueType as VariableValueType;
    });
    requiredVariableValues = mergeAsRightArrayUniq(
      requiredVariableValues,
      temp1,
    );
    optionalVariableValues = mergeAsRightArrayUniq(
      optionalVariableValues,
      temp2,
    );
  });
});

function mergeAsRightArrayUniq(
  arr1: VariableValueType[],
  arr2: VariableValueType[],
): VariableValueType[] {
  return uniqByKeepLast(arr2, v => v.name)
    .map(v => {
      return {
        name: v.name,
        value: arr1.find(v2 => v.name === v2.name)?.value ?? "",
      };
    });
}

export function getVariableValues() {
  return requiredVariableValues.concat(optionalVariableValues).filter(v =>
    v.value.trim().length > 0
  );
}
</script>
<div>
  Required variables
  <span class="text-error md:" aria-label="required"> * </span>
</div>
{#each requiredVariableValues as variable (variable.name)}
  <div class="border rounded p-2">
    <label>
      <div>
        Name
      </div>
      <input
        class="w-full h-11 min-h-11 p-2 rounded border border-solid border-base-content"
        placeholder="Variable name"
        name="varName"
        required
        value={variable.name}
        disabled
      />
    </label>
    <label>
      <div>
        Value<span class="text-error md:" aria-label="required"> * </span>
      </div>
      <VariableValue
        internalVariable={internalVariables.find(v => variable.name === v.name) as InternalVariable}
        oninput={v => {
          debounce.debounceAsync((value: string) => {
            variable.value = value;
          })(v);
        }}
      />
    </label>
  </div>
{/each}
<div>Optional variables</div>
{#each optionalVariableValues as variable (variable.name)}
  <div class="border rounded p-2">
    <label>
      <div>
        Name
      </div>
      <input
        class="w-full h-11 min-h-11 p-2 rounded border border-solid border-base-content"
        placeholder="Variable name"
        name="varName"
        required
        value={variable.name}
        disabled
      />
    </label>
    <label>
      <div>
        Value
      </div>
      <VariableValue
        internalVariable={internalVariables.find(v => variable.name === v.name) as InternalVariable}
        oninput={v => {
          debounce.debounceAsync((value: string) => {
            variable.value = value;
          })(v);
        }}
      />
    </label>
  </div>
{/each}

<style>
label {
  display: grid;
  grid-template-columns: 8rem auto;
  margin-bottom: 0.25rem;
  align-items: center;
}

@media (width < 48rem) {
  label {
    display: block;
  }
}
</style>
