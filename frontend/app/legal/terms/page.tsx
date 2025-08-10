import React from "react";
import ReactMarkdown from "react-markdown";
import { fetchNotionMarkdown } from "@/lib/notion";

export const dynamic = "force-static";

export default async function TermsPage() {
  const { markdown } = await fetchNotionMarkdown({
    pageIdEnvVar: "NOTION_TERMS_PAGE_ID",
    fallbackSearchQuery: "Terms",
  });

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 prose prose-invert">
      <h1>Terms and Conditions</h1>
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </main>
  );
}


