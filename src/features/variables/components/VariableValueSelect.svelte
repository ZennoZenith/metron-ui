<script lang="ts">
import { uniqByKeepLast } from "$utils";
import { Debounce } from "$utils/debounce";
import { isEmptyString } from "$utils/helpers";
import { untrack } from "svelte";
import { InternalVariableValues } from "../schemas/variable-values.svelte";
import VariableValue from "./VariableValue.svelte";

interface Props {
  requiredInternalVariableValues: Readonly<InternalVariableValues>;
  optionalInternalVariableValues: Readonly<InternalVariableValues>;
}

const {
  requiredInternalVariableValues = new InternalVariableValues(),
  optionalInternalVariableValues = new InternalVariableValues(),
}: Props = $props();

const debounce = new Debounce();

// let internalVariableWithoutValue = $state(
//   internalVariables.map(v => {
//     const clone = v.clone();
//     clone.value = undefined;
//     clone.label = "";
//     return clone;
//   }),
// );

// $effect(() => {
//   internalVariables;
//   untrack(() => {
//     internalVariableWithoutValue = internalVariables.map(v => {
//       const clone = v.clone();
//       if (!isEmptyString(v.value)) {
//         v.nullable = true; // HACK: to make internalVariable optional
//       }
//       clone.value = undefined;
//       clone.label = "";
//       return clone;
//     });
//     internalVariableWithoutValue.forEach(v => v.log());
//   });
// });
// ===========================================================================
//
// $inspect(internalVariables);

// const requiredVariables = $derived(
//   internalVariableWithoutValue.filter(v => v.required === true),
// );
// const optionalVariables = $derived(
//   internalVariableWithoutValue.filter(v => v.required === false),
// );

// let requiredVariableValues = $state<VariableValueType[]>([]);
// let optionalVariableValues = $state<VariableValueType[]>([]);

// $effect(() => {
//   internalVariables;
//   untrack(() => {
//     const temp1 = requiredVariables.map(v => {
//       return {
//         name: v.name,
//         value: "",
//       } satisfies VariableValueType as VariableValueType;
//     });
//     const temp2 = optionalVariables.map(v => {
//       return {
//         name: v.name,
//         value: "",
//       } satisfies VariableValueType as VariableValueType;
//     });
//     requiredVariableValues = mergeAsRightArrayUniq(
//       requiredVariableValues,
//       temp1,
//     );
//     optionalVariableValues = mergeAsRightArrayUniq(
//       optionalVariableValues,
//       temp2,
//     );
//   });
// });

// function mergeAsRightArrayUniq(
//   arr1: VariableValueType[],
//   arr2: VariableValueType[],
// ): VariableValueType[] {
//   return uniqByKeepLast(arr2, v => v.name)
//     .map(v => {
//       return {
//         name: v.name,
//         value: arr1.find(v2 => v.name === v2.name)?.value ?? "",
//       };
//     });
// }

export function getVariableValues() {
  // return $state.snapshot(requiredVariableValues).concat(
  //   $state.snapshot(optionalVariableValues),
  // )
  //   .filter(v => v.value.trim().length > 0);

  return [];
}
</script>
<div>
  Required variables
  <span class="text-error md:" aria-label="required"> * </span>
</div>
{#each requiredInternalVariableValues.internalVariableValues as
  variable
  (variable.name)
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
      <VariableValue internalVariableValue={variable} />
    </label>
  </div>
{/each}

<div>Optional variables</div>
{#each optionalInternalVariableValues.internalVariableValues as
  variable
  (variable.name)
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
      <VariableValue internalVariableValue={variable} />
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
