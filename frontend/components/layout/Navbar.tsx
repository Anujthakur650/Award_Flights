"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-noir-black/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 min-h-14 py-2 md:py-0 md:h-14">
        <Link href="/" className="font-display text-lg tracking-wider">
          <span className="text-white">AERO</span>
          <span className="bg-gradient-to-r from-luxe-gold-dark to-luxe-gold-bright bg-clip-text text-transparent ml-1">POINTS</span>
        </Link>
        <nav className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-white/80">
            <Link href="/legal/terms" className="hover:text-white">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/legal/cookies" className="hover:text-white">Cookies</Link>
          </div>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-md border border-white/15 px-3 py-2 text-xs md:text-sm text-white hover:bg-white/10 transition">
                Sign in
              </button>
            </SignInButton>
            <Link
              href="/sign-up"
              className="rounded-md bg-gradient-to-r from-luxe-gold-dark to-luxe-gold-bright px-3 py-2 text-xs md:text-sm text-black font-medium hover:opacity-90 transition"
            >
              Create account
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}
