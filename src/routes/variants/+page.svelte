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
    typ: "text",
    nullable: false,
    defaultValue: undefined,
  },
  {
    name: "name3",
    typ: "text",
    nullable: true,
    defaultValue: undefined,
  },
  {
    name: "name4",
    typ: "text",
    nullable: true,
    defaultValue: "some other default value",
  },
  {
    name: "name5",
    typ: "image",
    nullable: false,
    defaultValue: "some image id",
  },
]);
</script>

<Variables
  bind:this={variablesRef}
  allowedValues={["text", "image", "equation", "concept", "problem"]}
  defaultVariables={variables}
/>

<Variants variables={variablesRef?.getVariables()} />
