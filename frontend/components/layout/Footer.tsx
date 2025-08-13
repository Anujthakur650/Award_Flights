import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-noir-black/60 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <nav className="flex flex-col items-center gap-2 text-xs text-white/70 sm:flex-row sm:justify-center sm:gap-4 md:text-sm">
          <Link href="/legal/terms" className="hover:text-white">Terms</Link>
          <span className="hidden sm:inline text-white/20">|</span>
          <Link href="/legal/privacy" className="hover:text-white">Privacy</Link>
          <span className="hidden sm:inline text-white/20">|</span>
          <Link href="/legal/cookies" className="hover:text-white">Cookies</Link>
        </nav>
      </div>
    </footer>
  );
}


