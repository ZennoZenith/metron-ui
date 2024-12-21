/*
  only declare fields which are public accessible
*/
import { env } from "$env/dynamic/public";

export const API_BASE_ROUTE = env.PUBLIC_API_BASE_ROUTE ?? "http://localhost:10105/api";
export const IMAGE_BASE_ROUTE = env.PUBLIC_IMAGE_BASE_ROUTE ?? "http://192.168.1.20:10109";
export const DEFAULT_TOAST_DURATION_TIME = 5000; // in milliseconds
export const isDevelopment = env.PUBLIC_NODE_ENV === "development";
