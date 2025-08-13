import { fetchNotionMarkdown } from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function CookiesPage() {
  const { markdown } = await fetchNotionMarkdown({
    pageIdEnvVar: "NOTION_COOKIES_PAGE_ID",
    fallbackSearchQuery: "Cookies",
  });

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-semibold mb-6">Cookie Policy</h1>
        <article className="whitespace-pre-wrap break-words text-white/90 leading-relaxed text-sm md:text-base">
          {markdown}
        </article>
      </div>
    </main>
  );
}


