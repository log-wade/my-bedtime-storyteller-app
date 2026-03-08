import { NextRequest, NextResponse } from "next/server";

const GUTENDEX_URL = "https://gutendex.com/books";

export type BookResult = {
  id: number;
  title: string;
  authors: { name: string }[];
  coverUrl: string | null;
  textPlainUrl: string | null;
  languages: string[];
};

function pickTextPlainUrl(formats: Record<string, string>): string | null {
  return (
    formats["text/plain; charset=utf-8"] ??
    formats["text/plain; charset=us-ascii"] ??
    null
  );
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const page = request.nextUrl.searchParams.get("page") ?? "1";

  if (!q) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required" },
      { status: 400 }
    );
  }

  try {
    const url = `${GUTENDEX_URL}/?search=${encodeURIComponent(q)}&page=${page}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error("Gutendex request failed");
    const data = (await res.json()) as {
      results?: Array<{
        id: number;
        title: string;
        authors: { name: string }[];
        formats?: Record<string, string>;
        languages?: string[];
      }>;
    };

    const results: BookResult[] = (data.results ?? [])
      .filter((b) => b.formats && pickTextPlainUrl(b.formats))
      .map((b) => ({
        id: b.id,
        title: b.title,
        authors: b.authors ?? [],
        coverUrl:
          b.formats?.["image/jpeg"] ??
          `https://www.gutenberg.org/cache/epub/${b.id}/pg${b.id}.cover.medium.jpg`,
        textPlainUrl: pickTextPlainUrl(b.formats!),
        languages: b.languages ?? [],
      }));

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Books API error:", err);
    return NextResponse.json(
      { error: "Failed to search books" },
      { status: 502 }
    );
  }
}
