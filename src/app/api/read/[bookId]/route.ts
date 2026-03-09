import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";
import { auth } from "@/auth";
import { getSubscriptionByEmail } from "@/lib/subscription";

const GUTENDEX_URL = "https://gutendex.com/books";
const MAX_CHARS = 4500; // safe chunk for ElevenLabs
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel - good for reading

function pickTextPlainUrl(formats: Record<string, string>): string | null {
  return (
    formats["text/plain; charset=utf-8"] ??
    formats["text/plain; charset=us-ascii"] ??
    null
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await params;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY is not set" },
      { status: 503 }
    );
  }

  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json(
      { error: "Sign in to listen" },
      { status: 401 }
    );
  }
  const { hasActiveSubscription } = await getSubscriptionByEmail(email);
  if (!hasActiveSubscription) {
    return NextResponse.json(
      { error: "Subscription required. Start a 7-day free trial on the Pricing page." },
      { status: 403 }
    );
  }

  try {
    const bookRes = await fetch(`${GUTENDEX_URL}/${bookId}`, {
      next: { revalidate: 3600 },
    });
    if (!bookRes.ok) throw new Error("Book not found");
    const book = (await bookRes.json()) as {
      formats?: Record<string, string>;
    };
    const textUrl = book.formats && pickTextPlainUrl(book.formats);
    if (!textUrl) {
      return NextResponse.json(
        { error: "No plain text available for this book" },
        { status: 404 }
      );
    }

    const textRes = await fetch(textUrl, { next: { revalidate: 3600 } });
    if (!textRes.ok) throw new Error("Failed to fetch book text");
    let fullText = await textRes.text();
    fullText = fullText.replace(/\r\n/g, "\n").trim();
    const startMarker = "*** START OF";
    const endMarker = "*** END OF";
    const startIdx = fullText.indexOf(startMarker);
    const endIdx = fullText.indexOf(endMarker);
    if (startIdx !== -1) {
      const lineEnd = fullText.indexOf("\n", startIdx);
      fullText = (lineEnd !== -1 ? fullText.slice(lineEnd + 1) : fullText.slice(startIdx)).trim();
    }
    if (endIdx !== -1) fullText = fullText.slice(0, endIdx).trim();
    const chunk = fullText.slice(0, MAX_CHARS) || "No content.";

    const client = new ElevenLabsClient({ apiKey });
    const audioStream = await client.textToSpeech.convert(DEFAULT_VOICE_ID, {
      text: chunk,
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
    });

    const chunks: Uint8Array[] = [];
    const reader = audioStream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(buffer.length),
      },
    });
  } catch (err) {
    console.error("Read API error:", err);
    return NextResponse.json(
      { error: "Failed to generate audio" },
      { status: 502 }
    );
  }
}
