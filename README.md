# My Bedtime Storyteller

A website that lets visitors search for a book and have an AI voice agent read it to them. Built with Next.js and [ElevenLabs](https://elevenlabs.io) text-to-speech.

## Features

- **Book search** — Search by title or author. Results come from [Project Gutenberg](https://www.gutenberg.org/) (free, public-domain books) via [Gutendex](https://gutendex.com/).
- **Voice agent** — ElevenLabs turns the book text into natural speech. Click **Read to me** on any result to hear the start of the book.

## Setup

1. **Clone and install**

   ```bash
   git clone https://github.com/log-wade/my-bedtime-storyteller-app.git
   cd my-bedtime-storyteller-app
   npm install
   ```

2. **ElevenLabs API key**

   - Sign up at [elevenlabs.io](https://elevenlabs.io).
   - Create an API key at [Settings → API Keys](https://elevenlabs.io/app/settings/api-keys).
   - Copy `.env.example` to `.env` and set:

   ```bash
   cp .env.example .env
   # Edit .env and set ELEVENLABS_API_KEY=your_key_here
   ```

3. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000), search for a book (e.g. “Dickens” or “Pride and Prejudice”), then click **Read to me**.

## Tech

- **Next.js 16** (App Router)
- **ElevenLabs** — text-to-speech ([@elevenlabs/elevenlabs-js](https://www.npmjs.com/package/@elevenlabs/elevenlabs-js))
- **Gutendex** — Project Gutenberg book search and metadata
- **Tailwind CSS** — styling

## Live app

**https://my-bedtime-storyteller-app.vercel.app**

Book search works without an API key. To enable **Read to me** in production, add `ELEVENLABS_API_KEY` in [Vercel → Project → Settings → Environment Variables](https://vercel.com/logans-projects-8af184d7/my-bedtime-storyteller-app/settings/environment-variables).

## Next steps (after setup)

1. **Run locally** — `npm run dev`, then open [http://localhost:3000](http://localhost:3000). Book search works immediately; **Read to me** requires `ELEVENLABS_API_KEY` in `.env`.
2. **Production voice** — In the Vercel project, add environment variable `ELEVENLABS_API_KEY` (same value as in `.env`) and redeploy so the voice agent works on the live site.

## API

- `GET /api/books?q=...` — Search books (Gutendex).
- `GET /api/read/[bookId]` — Generate and stream audio for the start of a book (ElevenLabs TTS). Requires `ELEVENLABS_API_KEY`.

## License

MIT
