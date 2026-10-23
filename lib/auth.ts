// Shared-password auth. Works in both the Edge middleware and Node routes.

export const AUTH_COOKIE = "endoodle_auth";

// The cookie holds a hash of the password, so changing APP_PASSWORD
// automatically signs everyone out.
export async function authToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`endoodle:v1:${password}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

export type AuthMode = "open" | "password" | "misconfigured";

// No password is fine while developing locally, but in production a missing
// password locks the site instead of exposing your OpenAI credits.
export function authMode(): AuthMode {
  if (process.env.APP_PASSWORD) return "password";
  return process.env.NODE_ENV === "production" ? "misconfigured" : "open";
}
