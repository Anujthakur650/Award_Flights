"use client";

import { useAuth } from "@clerk/nextjs";

type Options = {
  template?: string; // Clerk JWT template/audience
  baseUrl?: string; // e.g., process.env.NEXT_PUBLIC_API_URL
  onUnauthorized?: () => void; // optional handler for 401s
};

/**
 * useAuthorizedFetch returns a fetch-like function that automatically attaches the Clerk token.
 * Intended for client components. For server components/route handlers, use `auth()` from
 * `@clerk/nextjs/server` and attach the token there instead.
 */
export function useAuthorizedFetch(defaults?: Options) {
  const { getToken, isSignedIn } = useAuth();

  return async function authorizedFetch(
    input: string | URL | Request,
    init: RequestInit = {}
  ) {
    const headers = new Headers(init.headers || {});

    // Get a JWT from Clerk; use template if provided
    const token = await getToken(
      defaults?.template ? { template: defaults.template } : undefined
    );

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Add JSON content-type by default when sending a body
    if (!headers.has("Content-Type") && init.body) {
      headers.set("Content-Type", "application/json");
    }

    const urlStr = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const finalUrl = defaults?.baseUrl && !urlStr.startsWith("http")
      ? `${defaults.baseUrl}${urlStr}`
      : urlStr;

    const res = await fetch(finalUrl, { ...init, headers });

    if (res.status === 401 && defaults?.onUnauthorized) {
      defaults.onUnauthorized();
    }

    return res;
  };
}

/**
 * useApiFetch is a convenience wrapper preconfigured with NEXT_PUBLIC_API_URL.
 */
export function useApiFetch(opts?: Omit<Options, "baseUrl">) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  return useAuthorizedFetch({ baseUrl, ...opts });
}
