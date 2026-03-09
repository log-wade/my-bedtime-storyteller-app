import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListenButton } from "@/components/ListenButton";

type BookDetail = {
  id: number;
  title: string;
  authors: { name: string }[];
  formats?: Record<string, string>;
  summaries?: string[];
  subjects?: string[];
  bookshelves?: string[];
  languages?: string[];
};

async function getBook(id: string): Promise<BookDetail | null> {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  const res = await fetch(`${base}/api/books/${id}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  return res.json();
}

function coverUrl(book: BookDetail): string | null {
  return (
    book.formats?.["image/jpeg"] ??
    (book.id
      ? `https://www.gutenberg.org/cache/epub/${book.id}/pg${book.id}.cover.medium.jpg`
      : null)
  );
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) notFound();

  const cover = coverUrl(book);
  const description = book.summaries?.[0] ?? null;
  const authorsText = book.authors?.map((a) => a.name).join(", ") || "Unknown author";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans">
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <p className="mb-6">
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-amber-400 transition-colors"
          >
            ← Back to search
          </Link>
        </p>

        <article className="rounded-xl border border-slate-700/80 bg-slate-800/50 p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
            <div className="shrink-0">
              <div className="h-64 w-40 overflow-hidden rounded-lg bg-slate-700 sm:h-80 sm:w-52">
                {cover ? (
                  <Image
                    src={cover}
                    alt=""
                    width={208}
                    height={320}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-500 text-sm">
                    No cover
                  </div>
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {book.title}
              </h1>
              <p className="mt-2 text-slate-400">{authorsText}</p>

              {description && (
                <div className="mt-4">
                  <h2 className="text-sm font-medium text-slate-300">Description</h2>
                  <p className="mt-1 text-slate-300 leading-relaxed">
                    {description}
                  </p>
                </div>
              )}

              {book.subjects && book.subjects.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-sm font-medium text-slate-300">Subjects</h2>
                  <ul className="mt-1 flex flex-wrap gap-2">
                    {book.subjects.map((s) => (
                      <li
                        key={s}
                        className="rounded-md bg-slate-700/80 px-2 py-1 text-xs text-slate-300"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {book.languages && book.languages.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-sm font-medium text-slate-300">Languages</h2>
                  <p className="mt-1 text-slate-300">
                    {book.languages.join(", ")}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <ListenButton bookId={book.id} title={book.title} />
              </div>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
