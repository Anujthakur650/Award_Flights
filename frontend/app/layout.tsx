import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AeroPoints - Premium Award Travel Platform",
  description: "Experience luxury travel with our premium award flight search. Find the perfect flight using your points.",
  keywords: "award travel, flight points, luxury travel, premium flights, airline miles",
  authors: [{ name: "AeroPoints" }],
  openGraph: {
    title: "AeroPoints - Premium Award Travel Platform",
    description: "Experience luxury travel with our premium award flight search.",
    type: "website",
  },
};

// Ensure correct mobile scaling and support for notched devices
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${dmSerif.variable} ${inter.variable} antialiased bg-noir-black text-white min-h-screen`}>
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
        >
          <Navbar />
          <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">{children}</div>
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
