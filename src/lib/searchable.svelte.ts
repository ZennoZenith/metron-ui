import { browser } from "$app/environment";

export default class CreateSearchable {
  showDropdown = $state(false);
  private focusLossTimeMs: number;
  constructor(focusLossTimeMs: number = 0) {
    this.focusLossTimeMs = focusLossTimeMs;
  }

  onFocus = (_event: FocusEvent) => {
    this.showDropdown = true;
  };

  onFocusLoss = (
    event: FocusEvent & {
      currentTarget: EventTarget & HTMLElement;
    },
  ) => {
    if (!browser) {
      this.closeDropdown();
      return;
    }

    const { relatedTarget, currentTarget } = event;
    if (
      relatedTarget instanceof HTMLElement
      && currentTarget?.contains(relatedTarget)
    ) return;

    this.closeDropdown();
  };

  closeDropdown = () => {
    setTimeout(() => {
      this.showDropdown = false;
    }, this.focusLossTimeMs);
  };
}
