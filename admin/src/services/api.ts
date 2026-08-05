const stripTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

const configuredApiUrl = stripTrailingSlashes(import.meta.env.VITE_API_URL?.trim() ?? "");

const normalizeApiBaseUrl = (value: string) => {
  if (!value) return "/api/v1";
  if (value.endsWith("/api/v1")) return value;
  if (value.endsWith("/api")) return `${value}/v1`;
  return `${value}/api/v1`;
};

export const apiBaseUrl = normalizeApiBaseUrl(configuredApiUrl);

export const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};
