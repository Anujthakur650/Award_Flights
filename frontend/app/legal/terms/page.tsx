import { fetchNotionMarkdown } from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const { markdown } = await fetchNotionMarkdown({
    pageIdEnvVar: "NOTION_TERMS_PAGE_ID",
    fallbackSearchQuery: "Terms",
  });

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-semibold mb-6">Terms & Conditions</h1>
        <article className="whitespace-pre-wrap break-words text-white/90 leading-relaxed text-sm md:text-base">
          {markdown}
        </article>
      </div>
    </main>
  );
}


