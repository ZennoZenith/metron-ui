<script lang="ts">
import Variables from "$features/variables/components/Variables.svelte";
import Variants from "$features/variants/components/Variants.svelte";
import { VARIABLE_TYPES, type VariableArray } from "$schemas/variable.svelte";

let variablesRef = $state<Variables>();

const variables: VariableArray = $state([
  {
    name: "name1",
    typ: "text",
    nullable: false,
    defaultValue: "some default vaue",
  },
  {
    name: "name2",
    typ: "image",
    nullable: false,
    defaultValue: undefined,
  },
  {
    name: "name3",
    typ: "equation",
    nullable: false,
    defaultValue: undefined,
  },
  {
    name: "name4",
    typ: "concept",
    nullable: true,
    defaultValue: undefined,
  },
]);
</script>

<Variables
  bind:this={variablesRef}
  allowedValues={structuredClone(VARIABLE_TYPES)}
  defaultInternalVariables={variables}
/>

<Variants internalVariables={variablesRef?.getVariables()} />
