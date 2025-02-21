<script lang="ts">
import { InfoSectionCreate, SectionCreate } from "./index";

type Props = {
  disabled?: boolean;
};
import { onMount } from "svelte";
import { updateEventName } from "../events/info-section";
import { setFormContext } from "../schemas/internal-forms.svelte";
import type { InfoSectionUpdateSchema } from "../schemas/internal-info-section";

const { disabled }: Props = $props();
const FORM_KEY = Symbol("FORM");
const internalForm = setFormContext(FORM_KEY);

onMount(() => {
  document.addEventListener(
    updateEventName,
    event =>
      internalForm.handleInfoSectionUpdate(
        (event as Event & { detail: InfoSectionUpdateSchema }).detail,
      ),
    { capture: true },
  );
});
</script>

<InfoSectionCreate {disabled} />
<SectionCreate {disabled} />
