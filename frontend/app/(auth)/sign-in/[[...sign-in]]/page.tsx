"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-noir-black text-white p-4">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: "bg-luxe-gold-dark hover:bg-luxe-gold-bright text-black",
          },
        }}
      />
    </main>
  );
}
