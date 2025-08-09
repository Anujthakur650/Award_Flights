import { clerkMiddleware } from "@clerk/nextjs/server";

// Keep middleware minimal to avoid over-restricting pages.
// We protect sensitive pages using SignedIn/SignedOut components and route-level checks.
export default clerkMiddleware();

// See https://clerk.com/docs/references/nextjs/auth-middleware for matcher recommendations
export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
