import { z } from "zod";

import { ApiError } from "@/lib/api-error";

import { apiEnvelopeSchema } from "./schemas";

export const ACCESS_TOKEN_STORAGE_KEY = "accessToken";
export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL ?? "/api");

type QueryValue = string | number | boolean | null | undefined;

type ApiRequestOptions<T> = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: HeadersInit;
  query?: Record<string, QueryValue>;
  responseSchema: z.ZodType<T>;
};

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function setAccessToken(token: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  }
}

export function clearAccessToken(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }
}

export async function apiRequest<T>(
  path: string,
  { body, headers, query, responseSchema, ...requestInit }: ApiRequestOptions<T>,
): Promise<T> {
  const response = await fetch(buildApiUrl(path, query), {
    ...requestInit,
    headers: buildHeaders(headers, body),
    body: serializeBody(body),
  });

  const json = await parseJson(response);
  const envelopeResult = apiEnvelopeSchema(responseSchema).safeParse(json);

  if (!envelopeResult.success) {
    throw new ApiError(response.ok ? "Unexpected API response." : response.statusText, {
      status: response.status,
      details: envelopeResult.error.flatten(),
    });
  }

  const envelope = envelopeResult.data;

  if (!envelope.success) {
    throw new ApiError(envelope.error, {
      status: response.status,
      details: json,
    });
  }

  if (!response.ok) {
    throw new ApiError(response.statusText || `API request failed with status ${response.status}.`, {
      status: response.status,
      details: json,
    });
  }

  return envelope.data;
}

export function apiGet<T>(
  path: string,
  responseSchema: z.ZodType<T>,
  query?: Record<string, QueryValue>,
): Promise<T> {
  return apiRequest(path, {
    method: "GET",
    query,
    responseSchema,
  });
}

export function apiPost<T>(
  path: string,
  body: unknown,
  responseSchema: z.ZodType<T>,
): Promise<T> {
  return apiRequest(path, {
    method: "POST",
    body,
    responseSchema,
  });
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function buildApiUrl(path: string, query?: Record<string, QueryValue>): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

function buildHeaders(headers: HeadersInit | undefined, body: unknown): Headers {
  const nextHeaders = new Headers(headers);
  const accessToken = getAccessToken();

  if (accessToken) {
    nextHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  if (body !== undefined && !(body instanceof FormData) && !nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }

  return nextHeaders;
}

function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined) {
    return undefined;
  }

  if (body instanceof FormData) {
    return body;
  }

  return JSON.stringify(body);
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (cause) {
    throw new ApiError("API returned an invalid JSON response.", {
      status: response.status,
      cause,
      details: text,
    });
  }
}
