export class Debounce {
  private timeout: ReturnType<typeof setTimeout> | undefined;
  private waitTime: number;

  constructor(wait = 300) {
    this.waitTime = wait;
  }

  // Disabled because of Function type
  // eslint-disable-next-line
  // biome-ignore lint/complexity/noBannedTypes: Use of Function
  debounce = (callback: Function, wait?: number) => {
    const waitTime = wait ?? this.waitTime;
    // Disabled because of any type
    // eslint-disable-next-line
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return (...args: any[]) => {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => callback(...args), waitTime);
    };
  };

  // Disabled because of Function type
  // eslint-disable-next-line
  // biome-ignore lint/complexity/noBannedTypes: Use of Function
  debounceAsync = (callback: Function, wait?: number) => {
    const waitTime = wait ?? this.waitTime;
    // Disabled because of any type
    // eslint-disable-next-line
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return (...args: any[]) => {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(async () => await callback(...args), waitTime);
    };
  };
}
