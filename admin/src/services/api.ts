const stripTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

const configuredApiUrl = stripTrailingSlashes(import.meta.env.VITE_API_URL?.trim() ?? "");

export const apiBaseUrl = configuredApiUrl
  ? configuredApiUrl.endsWith("/api/v1")
    ? configuredApiUrl
    : `${configuredApiUrl}/api/v1`
  : "/api/v1";

export const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};
