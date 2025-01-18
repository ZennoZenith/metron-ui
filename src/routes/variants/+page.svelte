<script lang="ts">
import Variables from "$features/variables/components/Variables.svelte";
import Variants from "$features/variants/components/Variants.svelte";
import type { VariableArray } from "$schemas/variable";

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
  allowedValues={["text", "image", "equation", "concept", "problem"]}
  defaultVariables={variables}
/>

<Variants variables={variablesRef?.getVariables()} />
