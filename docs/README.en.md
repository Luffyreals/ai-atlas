# AI Atlas

[![CI](https://github.com/Luffyreals/ai-atlas/actions/workflows/ci.yml/badge.svg)](https://github.com/Luffyreals/ai-atlas/actions/workflows/ci.yml)
[![Deploy](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-f38020?logo=cloudflare&logoColor=white)](https://ai-atlas-7nb.pages.dev/)
[![License: MIT](https://img.shields.io/badge/Code-MIT-blue.svg)](../LICENSE)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/Content-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

[Tiếng Việt](../README.md) | **English**

> **A map of AI knowledge:** from Python fundamentals to large language models (LLMs), explained from intuition to mathematics, completely free and open source.

🌐 **Live Website:** [https://ai-atlas-7nb.pages.dev/](https://ai-atlas-7nb.pages.dev/)

---

## 🧭 Overview

**AI Atlas** is a bilingual (**Vietnamese – English**) AI wiki and learning roadmap designed to solve the biggest hurdle in self-studying Artificial Intelligence: *"What should I learn first, what comes next, and why?"*.

### Highlights

- 🗺️ **Visual Roadmap:** An interactive roadmap organizing topics by prerequisite dependencies—click any topic node to jump straight to its lesson.
- 💡 **From Intuition to Math:** Starts with real-world analogies before diving into rigorous formulas step by step.
- 🎛️ **Interactive Visualizations & In-browser Code:** Manipulate algorithm parameters interactively; run and edit Python code directly in your browser with Pyodide—no local setup needed.
- 🌐 **Bilingual & Privacy-first:** Full Vietnamese and English content; no accounts or sign-ups required, your learning progress stays stored in your local browser.

---

## 📚 Curriculum Roadmap

The project covers **78 structured lessons** across 5 phases:

1. **Python for AI** (7 lessons): Syntax, data structures, OOP, NumPy, Pandas, Matplotlib.
2. **Mathematics for AI** (3 lessons): Linear Algebra, Calculus, Probability & Statistics.
3. **Machine Learning** (14 lessons): Regression, Classification, Clustering, Gradient Descent, Model Evaluation.
4. **Deep Learning** (8 lessons): Neural Networks, Backpropagation, CNN, RNN, LSTM, Transformers.
5. **Specialized Tracks:**
   - **NLP** (13 lessons): Tokenizers, Word Embeddings, BERT, GPT, language tasks.
   - **Computer Vision** (10 lessons): Image Classification, Segmentation, CLIP, Image Generation, Diffusion.
   - **LLM & GenAI** (23 lessons): Prompt Engineering, RAG, Agents, Fine-tuning, RLHF/DPO, Deployment.

---

## 🛠️ Tech Stack

- **Documentation Engine:** [Astro 7](https://astro.build) + [Starlight](https://starlight.astro.build)
- **Content:** [MDX](https://mdxjs.com) + [KaTeX](https://katex.org) (math typesetting)
- **Interactivity:** [React](https://react.dev) + [Pyodide](https://pyodide.org) (browser-based Python via WebAssembly)
- **Search:** [Pagefind](https://pagefind.app) (static, serverless client search)
- **Hosting & Deploy:** [Cloudflare Pages](https://ai-atlas-7nb.pages.dev/)

---

## 🚀 Local Development

Prerequisites: **Node.js 24.15.0** (pinned in [.node-version](../.node-version), minimum `>=22.23.4`) and npm.

```sh
# 1. Clone repository
git clone https://github.com/Luffyreals/ai-atlas.git
cd ai-atlas

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open your browser at [http://localhost:4321/vi/](http://localhost:4321/vi/) or [http://localhost:4321/en/](http://localhost:4321/en/).

### Key Commands

| Command | Description |
|---|---|
| `npm run build` | Build production bundle into `dist/` and validate all internal links |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run end-to-end tests (Playwright) |
| `npm run check` | Run TypeScript type-checking (`astro check`) |

---

## 👤 Author & Contact

- **Author:** Nguyễn Hoàng Tùng ([@Luffyreals](https://github.com/Luffyreals))
- **Email:** [hoangtungcnh@gmail.com](mailto:hoangtungcnh@gmail.com)
- **Project Website:** [https://ai-atlas-7nb.pages.dev/](https://ai-atlas-7nb.pages.dev/)

---

## 🤝 Contributing & License

Contributions, feedback, and bug reports are warmly welcome via [Issues](https://github.com/Luffyreals/ai-atlas/issues) and [Pull Requests](https://github.com/Luffyreals/ai-atlas/pulls). See [CONTRIBUTING.md](../.github/CONTRIBUTING.md) for details.

- **Source Code:** [MIT License](../LICENSE).
- **Lessons & Illustrations:** [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
