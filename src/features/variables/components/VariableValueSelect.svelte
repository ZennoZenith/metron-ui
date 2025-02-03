<script lang="ts">
import { InternalVariableValue } from "$schemas/internal-variable-values.svelte";
import VariableValue from "./VariableValue.svelte";

interface Props {
  internalVariableValues: Readonly<InternalVariableValue[]>;
}

const { internalVariableValues }: Props = $props();

export function getInternalVariableValues() {
  return internalVariableValues;
}
</script>
<div>
  Required variables
  <span class="text-error md:" aria-label="required"> * </span>
</div>
{#each internalVariableValues.filter(v => v.required === true) as
  variable
  (variable.internalVariablePsudoId)
}
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
      <!-- HACK: Refresh VariableValue when type changes -->
      {#key variable.typ}
        <VariableValue
          internalVariablePsudoId={variable.internalVariablePsudoId}
          defaultLabel={variable.label}
          defaultValue={variable.value}
          typ={variable.typ}
          onChange={(value, label) => {
            variable.value = value;
            variable.label = label;
          }}
        />
      {/key}
    </label>
  </div>
{/each}

<div>Optional variables</div>
{#each internalVariableValues.filter(v => v.required === false) as
  variable
  (variable.internalVariablePsudoId)
}
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
      <!-- HACK: Refresh VariableValue when type changes -->
      {#key variable.typ}
        <VariableValue
          internalVariablePsudoId={variable.internalVariablePsudoId}
          defaultLabel={variable.label}
          defaultValue={variable.value}
          typ={variable.typ}
          onChange={(value, label) => {
            variable.value = value;
            variable.label = label;
          }}
        />
      {/key}
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
