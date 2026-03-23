# Dysmaths

Dysmaths is the official web app for writing and organizing math and geometry work in a simpler, more visual way.

It is designed for children who need extra support with writing, especially children with specific learning differences such as:

- dyspraxia
- dysgraphia
- and other needs that make handwriting or structured notation harder

Dysmaths helps users:

- write math directly in the browser
- work with geometry as well as algebra and other math content
- work with a cleaner, more guided layout
- use a school-style long division tool
- edit math blocks without relying on handwriting
- preview math clearly before exporting or printing
- use the app like a lightweight installable web app

The goal is to make math work less frustrating and more accessible, while keeping it close to the way mathematics is written on paper.

Official website: [Official website](https://dysmaths.com) · Created by [Guillaume Champeau](https://www.champeau.info)

The repository currently includes documentation for the long-division block in [`docs/division-written.md`](./docs/division-written.md).

## Screenshot

![Dysmaths screenshot](/img/screenshot.png)

## Features

- browser-based math workspace
- structured visual math editor
- long division support
- multilingual interface
- export-friendly document generation
- PWA support

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- next-intl
- Lexical
- MathLive
- KaTeX

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Start the production server

```bash
npm run start
```

### Lint the project

```bash
npm run lint
```

## Project Structure

- `app/` - Next.js app routes, layouts, manifest, and service worker endpoint
- `components/` - reusable UI and math editing components
- `docs/` - feature documentation
- `i18n/` - locale routing and request configuration
- `messages/` - translation content
- `public/` - static assets, including MathLive fonts
- `scripts/` - project-specific runtime helpers
- `types/` - custom TypeScript declarations

## Contributing

Contributions are welcome. Please read [`CONTRIBS.md`](./CONTRIBS.md) before opening a pull request.

## License

This project is licensed under the GNU Affero General Public License v3.0. See [`LICENSE`](./LICENSE) for the full text.
