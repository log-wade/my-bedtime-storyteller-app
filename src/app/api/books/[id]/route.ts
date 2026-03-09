import { NextRequest, NextResponse } from "next/server";

const GUTENDEX_URL = "https://gutendex.com/books";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { error: "Book id is required" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${GUTENDEX_URL}/${id}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: "Book not found" }, { status: 404 });
      }
      throw new Error("Gutendex request failed");
    }
    const book = await res.json();
    return NextResponse.json(book);
  } catch (err) {
    console.error("Books [id] API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch book" },
      { status: 502 }
    );
  }
}
