const LogLevels = ["INFO", "ERROR", "WARN", "DEBUG", "CRITICAL"] as const;

type FormatLogOptions = {
  message: any;
  logLevel: typeof LogLevels[number];
  eventTag?: string;
};

export class Log {
  constructor() {
    throw Error("Log is an static class and cannot be instantiated.");
  }
  private static FormatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure two digits
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const miliseconds = String(date.getMilliseconds()).padStart(3, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${miliseconds}`;
  }

  private static FormatLog(option: FormatLogOptions) {
    const log: string[] = [];
    log.push(Log.FormatDate(new Date()));
    log.push("INFO");
    if (option.eventTag) log.push(`Event: ${option.eventTag}`);
    log.push(`Message: ${option.message}`);
    return log.join(" | ");
  }

  static debug(message: any, eventTag?: string) {
    console.log(Log.FormatLog({ logLevel: "DEBUG", message, eventTag }));
  }
  static info(message: any | Record<string, unknown>, eventTag?: string) {
    console.log(Log.FormatLog({ logLevel: "INFO", message, eventTag }));
  }
  static warn(message: any, eventTag?: string) {
    console.log(Log.FormatLog({ logLevel: "WARN", message, eventTag }));
  }
  static error(message: any, eventTag?: string) {
    console.log(Log.FormatLog({ logLevel: "ERROR", message, eventTag }));
  }
  static critical(message: any, eventTag?: string) {
    console.log(Log.FormatLog({ logLevel: "CRITICAL", message, eventTag }));
  }
}
