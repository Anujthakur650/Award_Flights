"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-noir-black text-white p-4">
      <SignUp 
        appearance={{
          elements: {
            formButtonPrimary: "bg-luxe-gold-dark hover:bg-luxe-gold-bright text-black",
          },
        }}
      />
    </main>
  );
}
