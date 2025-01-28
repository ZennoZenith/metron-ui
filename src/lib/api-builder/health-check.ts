import type { RequiredOptions } from ".";

export default class HealthCheck {
  private readonly url: URL;

  constructor(options: RequiredOptions) {
    this.url = options.url;
  }

  async healthCheck() {
  }
}
