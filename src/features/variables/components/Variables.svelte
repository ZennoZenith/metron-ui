<script lang="ts">
import { VARIABLE_TYPES } from "$api/schemas/variable";
import { Switch } from "$components/melt";
import { PlusCircled, Trash } from "$icons";
import { getInternalVariablesContext } from "$schemas/internal-variable.svelte";
import type { VariableType } from "$type/variables";
import VariableSelect from "./VariableSelect.svelte";
import VariableValue from "./VariableValue.svelte";

interface Props {
  disabled?: boolean;
  disableNullable?: boolean;
  allowedValues?: VariableType[];
  variablesContextKey: symbol;
}

const {
  disableNullable = false,
  allowedValues = structuredClone(VARIABLE_TYPES),
  variablesContextKey,
  disabled = false,
}: Props = $props();

const internalVariables = getInternalVariablesContext(variablesContextKey);

function addInternalVariable() {
  internalVariables.addInternalVariable();
}

function removeInternalVariable(psudoId: string) {
  internalVariables.removeInternalVariable(psudoId);
}
</script>

<div class="grid grid-cols-1 gap-1 p-4">
  {#each internalVariables.internalVariables as
    internalVariable
    (internalVariable.psudoId)
  }
    <div class="relative grid grid-cols-1 sm:grid-cols-2 border-2 gap-2 p-2">
      <input
        type="text"
        class="w-full h-10 outline-none"
        value={internalVariable.name}
        placeholder="Variable name*"
        {disabled}
        oninput={event => internalVariable.name = event.currentTarget.value}
      >
      <VariableSelect
        defaultValue={internalVariable.typ}
        {allowedValues}
        {disabled}
        onChange={value => {
          internalVariable.value = "";
          internalVariable.label = "";
          internalVariable.typ = value;
        }}
      />
      {#if !disabled}
        <Switch
          label="Is nullable? "
          disabled={disableNullable}
          defaultChecked={internalVariable.nullable}
          onChange={state => {
            internalVariable.nullable = state;
          }}
        />
      {:else}
        <div>
          Nullable: <span>{internalVariable.nullable ? "Yes" : "No"}</span>
        </div>
      {/if}
      <!-- HACK: Refresh VariableValue when type changes -->
      {#key internalVariable.typ}
        <VariableValue
          internalVariablePsudoId={internalVariable.psudoId}
          defaultLabel={internalVariable.label}
          defaultValue={internalVariable.value}
          typ={internalVariable.typ}
          {disabled}
          onChange={(value, label) => {
            internalVariable.value = value;
            internalVariable.label = label;
          }}
        />
      {/key}
      {#if !disabled}
        <button
          class="absolute -right-3 top-3 bg-error text-error-content rounded-full p-1 hover:bg-magnum-100 focus:shadow-magnum-400"
          onclick={() => removeInternalVariable(internalVariable.psudoId)}
          type="button"
        >
          <Trash class="text-sm" />
        </button>
      {/if}
    </div>
  {/each}

  {#if !disabled}
    <div>
      <button
        class="flex items-center gap-2 bg-secondary text-secondary-content px-2 py-1 rounded-full"
        onclick={addInternalVariable}
        type="button"
      >
        Add variable <PlusCircled />
      </button>
    </div>
  {/if}
</div>
