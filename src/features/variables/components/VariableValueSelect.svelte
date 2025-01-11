<script lang="ts">
import type { VariableArray, VariableValue } from "$schemas/variable";
import { uniqByKeepLast } from "$utils";
import { untrack } from "svelte";

interface Props {
  variables: VariableArray;
}

const {
  variables,
}: Props = $props();

const requiredVariables = $derived(
  variables.filter(v =>
    v.nullable === false
    && (v.defaultValue === undefined || v.defaultValue === null)
  ),
);
const optionalVariables = $derived(
  variables.filter(v =>
    v.nullable === true
    || (v.defaultValue !== undefined && v.defaultValue !== null)
  ),
);

let requiredVariableValues = $state<VariableValue[]>([]);
let optionalVariableValues = $state<VariableValue[]>([]);
$effect(() => {
  variables;
  untrack(() => {
    const temp1 = requiredVariables.map(v => {
      return {
        name: v.name,
        value: "",
      } satisfies VariableValue as VariableValue;
    });
    const temp2 = optionalVariables.map(v => {
      return {
        name: v.name,
        value: "",
      } satisfies VariableValue as VariableValue;
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
  arr1: VariableValue[],
  arr2: VariableValue[],
): VariableValue[] {
  return uniqByKeepLast(arr2, v => v.name)
    .map(v => {
      return {
        name: v.name,
        value: arr1.find(v2 => v.name === v2.name)?.value ?? "",
      };
    });
}

export function getVariableValues() {
  return requiredVariableValues.concat(optionalVariableValues);
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
      <textarea
        class="w-full h-11 min-h-11 p-2 rounded border border-solid border-base-content"
        placeholder="Variable value"
        name="varValue"
        value={variable.value}
        oninput={event => variable.value = event.currentTarget.value}
      ></textarea>
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
      <textarea
        class="w-full h-11 min-h-11 p-2 rounded border border-solid border-base-content"
        placeholder="Variable value"
        name="varValue"
        value={variable.value}
        oninput={event => {
          variable.value = event.currentTarget.value;
        }}
      ></textarea>
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
