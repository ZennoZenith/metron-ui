/**
 * only declare fields which are public accessible
 */
import * as env from "$env/static/public";
import { toLogLevel } from "$utils/helpers";

export const LOG_LEVEL = toLogLevel(env.PUBLIC_LOG_LEVEL);
export const DEBOUNCE_OVERIDE_TIME_MSEC = parseInt(env.PUBLIC_DEBOUNCE_OVERIDE_TIME_MSEC ?? "10");
export const API_BASE_ROUTE = env.PUBLIC_API_BASE_ROUTE ?? "http://localhost:10105/api";
export const IMAGE_BASE_ROUTE = env.PUBLIC_IMAGE_BASE_ROUTE ?? "http://localhost:10109";
export const DEFAULT_TOAST_DURATION_TIME = 5000; // in milliseconds
export const isDevelopment = env.PUBLIC_NODE_ENV === "development";

export const API_TIMEOUT = env.PUBLIC_API_TIMEOUT ?? 15000;
export const API_HOST = env.PUBLIC_API_HOST ?? "127.0.0.1";
export const API_PORT = env.PUBLIC_API_PORT ?? "10105";
export const API_VRSION = env.PUBLIC_API_VRSION ?? "";
export const API_PROTOCOL = env.PUBLIC_API_PROTOCOL ?? "http";
