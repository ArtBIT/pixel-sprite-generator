# HTML5 Pixel Sprite Generator
[![GitHub license](https://img.shields.io/github/license/ArtBIT/pixel-sprite-generator.svg)](https://github.com/ArtBIT/pixel-sprite-generator) [![GitHub stars](https://img.shields.io/github/stars/ArtBIT/pixel-sprite-generator.svg)](https://github.com/ArtBIT/pixel-sprite-generator)  [![awesomeness](https://img.shields.io/badge/awesomeness-maximum-red.svg)](https://github.com/ArtBIT/pixel-sprite-generator)

This is a tiny web app that generates pixel sprite sheets based on a template.

| | | | |
|:---:|:---:|:---:|:---:|
| <img src="/assets/screenshot.png"> | <img src="/assets/helmets.png"> | <img src="/assets/turrets.png"> | <img src="/assets/alien-alphabet.png"> |

# Demo
Try out the live demo http://artbit.github.io/pixel-sprite-generator/

# Features

- Paint a template with **Empty**, **Body** and **Accent** brushes, and mark cells as **Fixed** so they are never randomized
- Horizontal and vertical mirroring, with the mirrored half shown live in the editor
- Optional outline, custom colors, zoom, padding and transparent background
- Seeded generation: the same seed always gives the same sprites
- Download a sprite sheet (any size up to 64×64) or click a single sprite to download it
- Share your exact setup with a link
- Save your own templates (kept in your browser)
- Undo/redo, keyboard shortcuts (press `?` in the app), touch support, light and dark themes

# Development

Requires Node.js 20 or newer.

```
git clone https://github.com/ArtBIT/pixel-sprite-generator.git
cd pixel-sprite-generator
npm install
npm run dev
```

Open [http://localhost:4000/](http://localhost:4000/) in your browser.

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm test` | Run the unit tests |
| `npm run lint` | Lint the code |
| `npm run build` | Type check and build into `demo/` |
| `npm run deploy` | Build and publish `demo/` to GitHub Pages |

Built with React, TypeScript and Vite.

# Credits

Inspired by http://davebollinger.org/works/pixelspaceships/

# License

[MIT](LICENSE)
