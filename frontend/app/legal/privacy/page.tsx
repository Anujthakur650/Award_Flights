import React from "react";
import ReactMarkdown from "react-markdown";
import { fetchNotionMarkdown } from "@/lib/notion";

export const dynamic = "force-static";

export default async function PrivacyPage() {
  const { markdown } = await fetchNotionMarkdown({
    pageIdEnvVar: "NOTION_PRIVACY_PAGE_ID",
    fallbackSearchQuery: "Privacy",
  });

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 prose prose-invert">
      <h1>Privacy Policy</h1>
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </main>
  );
}


