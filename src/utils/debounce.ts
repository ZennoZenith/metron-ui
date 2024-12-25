export class Debounce {
  private timeout: ReturnType<typeof setTimeout> | undefined;
  private waitTime: number;

  constructor(wait: number = 300) {
    this.waitTime = wait;
  }

  // Disabled because of Function type
  // eslint-disable-next-line
  debounce = (callback: Function, wait?: number) => {
    wait ??= this.waitTime;
    // Disabled because of any type
    // eslint-disable-next-line
    return (...args: any[]) => {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => callback(...args), wait);
    };
  };

  // Disabled because of Function type
  // eslint-disable-next-line
  debounceAsync = (callback: Function, wait?: number) => {
    wait ??= this.waitTime;
    // Disabled because of any type
    // eslint-disable-next-line
    return (...args: any[]) => {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(async () => await callback(...args), wait);
    };
  };
}
