# APOD Archive

Browse NASA's Astronomy Picture of the Day archive — every image and video since June 16, 1995.

## Features

- Date picker, prev/next buttons, keyboard arrows (← →), and random
- Image and video support (YouTube, Vimeo embeds)
- Shareable URLs per date
- Session caching for faster browsing

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173/apod-archive/](http://localhost:5173/apod-archive/)

## Build

```bash
npm run build
npm run preview
```

## API Key

The NASA APOD API requires an API key. Get a free one at [api.nasa.gov](https://api.nasa.gov/).

Set it in `.env`:
```
VITE_NASA_API_KEY=your_key_here
```

For GitHub Pages deployment, add `VITE_NASA_API_KEY` as a repository secret.

## Deployment

Pushes to `main` automatically deploy to GitHub Pages via the included workflow.
