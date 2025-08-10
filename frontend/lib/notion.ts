import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

function getNotionClient(): Client | null {
  const token = process.env.NOTION_TOKEN;
  if (!token) return null;
  return new Client({ auth: token });
}

export async function fetchNotionMarkdown(opts: {
  pageIdEnvVar?: string;
  fallbackSearchQuery?: string;
}): Promise<{ markdown: string; source: string }> {
  const client = getNotionClient();
  if (!client) {
    return {
      markdown:
        "Notion integration is not configured. Set NOTION_TOKEN and the relevant page ID env var.",
      source: "missing-token",
    };
  }

  const n2m = new NotionToMarkdown({ notionClient: client });

  // Read pageId from env if provided
  const pageId = opts.pageIdEnvVar ? process.env[opts.pageIdEnvVar] : undefined;

  // Helper to render a pageId
  const renderByPageId = async (id: string) => {
    const mdBlocks = await n2m.pageToMarkdown(id);
    const mdString = n2m.toMarkdownString(mdBlocks).parent;
    return mdString || "";
  };

  // If page id is set, use that first
  if (pageId) {
    try {
      const markdown = await renderByPageId(pageId);
      if (markdown.trim().length > 0) {
        return { markdown, source: "page-id" };
      }
    } catch {}
  }

  // Fallback: try search by title keyword
  if (opts.fallbackSearchQuery) {
    try {
      const search = await client.search({
        query: opts.fallbackSearchQuery,
        filter: { value: "page", property: "object" },
        page_size: 1,
      });
      const first = search.results[0] as any | undefined;
      const id = first?.id;
      if (id) {
        const markdown = await renderByPageId(id);
        if (markdown.trim().length > 0) {
          return { markdown, source: "search" };
        }
      }
    } catch {}
  }

  return {
    markdown:
      "Legal document not found. Provide the Notion page ID via environment variables to display content.",
    source: "not-found",
  };
}


