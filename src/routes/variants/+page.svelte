<script lang="ts">
import Variants from "$features/variants/components/Variants.svelte";
import type { VariableArray } from "$schemas/variable";
const variables: VariableArray = $state([
  {
    name: "name1",
    typ: "string",
    nullable: false,
    defaultValue: "some default vaue",
  },
  {
    name: "name2",
    typ: "string",
    nullable: false,
    defaultValue: undefined,
  },
  {
    name: "name3",
    typ: "string",
    nullable: true,
    defaultValue: undefined,
  },
  {
    name: "name4",
    typ: "string",
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

<Variants {variables} />
