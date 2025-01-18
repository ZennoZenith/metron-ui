<script lang="ts">
import Variables from "$features/variables/components/Variables.svelte";
import type { VariableArray } from "$schemas/variable";
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

<Variables defaultVariables={variables} />
