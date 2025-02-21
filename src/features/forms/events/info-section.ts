import type { InfoSectionUpdateSchema } from "../schemas/internal-info-section";

export const updateEventName = "infoSection:update";

export function UpdateEvent(detail: InfoSectionUpdateSchema) {
  return new CustomEvent<InfoSectionUpdateSchema>(updateEventName, {
    detail,
    bubbles: true,
    cancelable: true,
    composed: false,
  });
}
