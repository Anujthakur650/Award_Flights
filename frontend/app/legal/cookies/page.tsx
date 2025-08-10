import React from "react";
import ReactMarkdown from "react-markdown";
import { fetchNotionMarkdown } from "@/lib/notion";

export const dynamic = "force-static";

export default async function CookiesPage() {
  const { markdown } = await fetchNotionMarkdown({
    pageIdEnvVar: "NOTION_COOKIES_PAGE_ID",
    fallbackSearchQuery: "Cookie Policy",
  });

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 prose prose-invert">
      <h1>Cookie Policy</h1>
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </main>
  );
}


