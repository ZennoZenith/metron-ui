<script lang="ts">
import { uuidv4 } from "$utils/helpers";
import { UpdateEvent } from "../events/info-section";
import type { InfoSectionSchema } from "../schemas/internal-info-section";

type Props = {
  disabled?: boolean;
  defaultInfoSection?: InfoSectionSchema;
};

const { disabled = false, defaultInfoSection }: Props = $props();

let thisElement = $state<HTMLElement>();
const psudoId = uuidv4();
let title = $state(defaultInfoSection?.title ?? "Untitled section");
let description = $state(defaultInfoSection?.title ?? "");

function dispatchUpdateEvent() {
  thisElement?.dispatchEvent(
    UpdateEvent({
      psudoId,
      title: $state.snapshot(title),
      description: $state.snapshot(description),
    }),
  );
}
</script>

<section bind:this={thisElement} data-pusdo-id={psudoId}>
  <input
    type="text"
    name="section-title"
    bind:value={title}
    placeholder="Section title (required)"
    required
    {disabled}
    oninput={() => dispatchUpdateEvent()}
  >
  <textarea
    name="section-description"
    bind:value={description}
    placeholder="Description (optional)"
    {disabled}
    oninput={() => dispatchUpdateEvent()}
  ></textarea>
</section>
