import { Client } from "magic-hour";

// Security check: Ensure this file is never loaded on the client side
if (typeof window !== "undefined") {
  throw new Error(
    "Security Violation: Magic Hour client cannot be initialized in client-side code. This must run strictly on the server."
  );
}

let cachedClient: Client | null = null;

/**
 * Returns the singleton Magic Hour client instance initialized with MAGIC_HOUR_API_KEY.
 * Returns null if the API key is not configured (allowing graceful dev/mock fallback).
 */
export function getMagicHourClient(): Client | null {
  const apiKey = process.env.MAGIC_HOUR_API_KEY;

  if (!apiKey) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = new Client({
      token: apiKey,
    });
  }

  return cachedClient;
}

/**
 * Checks whether Magic Hour API is configured.
 */
export function isMagicHourConfigured(): boolean {
  return Boolean(process.env.MAGIC_HOUR_API_KEY);
}
