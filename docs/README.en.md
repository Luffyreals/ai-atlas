# AI Atlas

[![CI](https://github.com/Luffyreals/ai-atlas/actions/workflows/ci.yml/badge.svg)](https://github.com/Luffyreals/ai-atlas/actions/workflows/ci.yml)
[![Deploy](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-f38020?logo=cloudflare&logoColor=white)](https://ai-atlas-7nb.pages.dev/)
[![License: MIT](https://img.shields.io/badge/Code-MIT-blue.svg)](../LICENSE)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/Content-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

[Tiếng Việt](../README.md) | **English**

> **A comprehensive map of Artificial Intelligence knowledge:** from Python fundamentals to modern Large Language Models (LLMs), lucidly explained from everyday intuition to mathematical rigor, completely open and free.

🌐 **Live Website:** [https://ai-atlas-7nb.pages.dev/](https://ai-atlas-7nb.pages.dev/)

---

## 🧭 Overview

**AI Atlas** is a bilingual (**Vietnamese – English**) AI wiki and interactive learning roadmap designed to solve the single greatest challenge in self-studying Artificial Intelligence: *"What should I learn first, what comes next, and what is the underlying essence of each concept?"*.

Rather than presenting isolated code snippets or dry formulas without context, AI Atlas guides you through each topic with a consistent pedagogical approach: **Build intuitive understanding → Master mathematical foundations → Visualize dynamically → Experiment with code directly in the browser**.

### ✨ Key Highlights

- 🗺️ **Visual Dependency Roadmap:** All 78 lessons are connected by explicit prerequisite relationships. You always know where a new concept originates and where it leads.
- 💡 **Intuition Before Formalism:** Every lesson begins with real-world analogies, thoroughly clarifying the "why" before diving into step-by-step mathematical derivations with KaTeX.
- 🎛️ **Interactive Visualizations (VIZ):** Adjust sliders to see linear regression lines fit in real time, watch gradient descent traverse loss surfaces, and observe probability distributions adapt during LLM sampling.
- 🐍 **In-Browser Python Execution (WebAssembly / Pyodide):** Experiment interactively without installing local runtimes. Edit and execute Python 3.10 code with full Matplotlib plotting right inside your browser.
- 🖥️ **Local Code Blocks (LocalCode):** For Deep Learning and LLM modules requiring GPUs or external APIs, lessons provide dedicated local execution blocks complete with environment variable guides and sample outputs from verified runs.
- 🔒 **Bilingual & Privacy-First:** Full support for both Vietnamese and English. No accounts or registrations required; all learning progress is securely stored in your local browser's `localStorage`.
- ⚡ **Optimized Performance:** Built on Astro 7 and Starlight with Fonts API integration eliminating layout shifts (CLS = 0) and instant client-side full-text search powered by Pagefind.

---

## 📚 Curriculum Roadmap (78 Lessons)

The learning path spans 5 core stages:

```
[Part 1: Python] ──> [Part 2: Mathematics] ──> [Part 3: Machine Learning]
                                                       │
                                                       ▼
                                             [Part 4: Deep Learning]
                                                       │
                 ┌─────────────────────────────────────┼─────────────────────────────────────┐
                 ▼                                     ▼                                     ▼
     [Part 5a: NLP Track]                  [Part 5b: Vision Track]              [Part 5c: LLM & GenAI Track]
```

### Module Breakdown:
1. **Python for AI** (7 lessons): Google Colab & Kaggle environments, core syntax, data structures, functions & I/O, OOP, NumPy & Pandas, data visualization (Matplotlib & Seaborn).
2. **Mathematics for AI** (3 lessons): Linear Algebra, Differential Calculus, Probability & Statistics.
3. **Machine Learning** (14 lessons): Linear Regression, Overfitting & Underfitting, Regularization (Ridge/Lasso/Elastic Net), Gradient Descent, Advanced Optimizers (Momentum, RMSProp, Adam), K-Means, K-Nearest Neighbors, Logistic Regression, Softmax Regression, Decision Trees & Random Forests, Data Preprocessing & Class Imbalance, End-to-End ML Project.
4. **Deep Learning** (8 lessons): Artificial Neural Networks & MLP, Backpropagation & Training Stability (BatchNorm, Dropout), Convolutional Neural Networks (CNN), Modern CNN Architectures (ResNet, MobileNet...), Recurrent Neural Networks (RNN), GRU, LSTM & BiLSTM, Transformers Architecture.
5. **Specialized Tracks:**
   - **Natural Language Processing - NLP** (13 lessons): Regex, Tokenization, Text Normalization, Vector Semantics, Word2Vec/GloVe/FastText, BERT, GPT & Distributed Pretraining, Information Retrieval, Sentiment Analysis, Named Entity Recognition, Text Generation & Summarization, Question Answering.
   - **Computer Vision - CV** (10 lessons): CNN & ViT Image Classification, Semantic Segmentation (U-Net, DeepLab), Instance Segmentation (Mask R-CNN, SAM), Multimodal Models (CLIP, BLIP), LLaVA, Generative Models (VAE, GAN), Diffusion Models (Stable Diffusion, LoRA), Augmentation & Self-Supervised Learning.
   - **Large Language Models - LLM & GenAI** (23 lessons): Text APIs, Gradio & Streamlit UIs, Prompt Engineering, Docker & Cloud Deployment, Custom Model Serving, RAG & Chatbots, Web Crawling & Vector Databases, LangChain & LlamaIndex, AI Agents, Graph RAG, Multimodal APIs, Building LLMs from Scratch, GPT & LLaMA Fine-tuning, Pre-training Data Curation, Alignment with RLHF & DPO, Model Evaluation & PEFT (LoRA, Quantization), Distributed Serving with vLLM.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Web Framework** | [Astro 7](https://astro.build) + [Starlight](https://starlight.astro.build) | High-performance static site generation with first-class internationalization |
| **Content Format** | [MDX](https://mdxjs.com) | Clean Markdown enriched with interactive React island components |
| **Math Typesetting** | [KaTeX](https://katex.org) | Rapid, beautiful formula rendering with accessible screen-reader labels |
| **UI Components** | [React 19](https://react.dev) | Interactive widgets (VIZs, Quizzes, Python Runner) loaded on demand |
| **Python Runtime** | [Pyodide](https://pyodide.org) | In-browser Python 3.10 and data science libraries executed via Web Workers |
| **Search Engine** | [Pagefind](https://pagefind.app) | Fast, serverless, static full-text search index |
| **Automated Testing** | [Vitest](https://vitest.dev) + [Playwright](https://playwright.dev) | Nearly 2,500 unit tests (2,496 tests) and multi-viewport end-to-end test suites |
| **Hosting & Edge CDN** | [Cloudflare Pages](https://pages.cloudflare.com) | Edge delivery, automated HTTPS, and HTTP response security headers |

---

## 📂 Repository Structure

```text
ai-atlas/
├── src/
│   ├── content/docs/
│   │   ├── vi/               # Complete 78 Vietnamese lessons
│   │   └── en/               # Complete 78 English lessons
│   ├── content/i18n/         # UI localization dictionaries (vi.json, en.json)
│   ├── components/           # React & Astro components (Quiz, Runner, VIZ, Figures)
│   ├── lib/                  # Mathematical utilities, SEO helpers, Pyodide client, Fonts
│   ├── data/                 # Roadmap definitions (roadmap.ts), datasets, figures
│   └── styles/               # CSS variables and typography tuned for light/dark themes
├── docs/                     # Technical specifications, architecture docs, decision log
│   ├── PLAN.md               # Master roadmap schedule and milestone status
│   ├── CHANGELOG.md          # Notable release history
│   ├── decisions.md          # Chronological record of architectural decisions
│   └── architecture/         # Detailed engineering specs (homepage, VIZ, launch, etc.)
├── tests/
│   ├── unit/                 # 2,490+ Vitest unit tests (math, content, syntax checks)
│   └── e2e/                  # Playwright end-to-end integration test suites
├── public/                   # Static assets, robots.txt, OpenGraph images, Cloudflare _headers
├── astro.config.ts           # Astro, Starlight, Fonts API, and KaTeX configuration
└── package.json              # Dependency manifests and automation scripts
```

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js:** `24.15.0` (pinned in [.node-version](../.node-version), minimum `>=22.23.4`)
- **Package Manager:** `npm` (bundled with Node.js)

### Installation & Running

```sh
# 1. Clone repository
git clone https://github.com/Luffyreals/ai-atlas.git
cd ai-atlas

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit the application at: [http://localhost:4321/vi/](http://localhost:4321/vi/)

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Launch local dev server with Hot Module Replacement |
| `npm run check` | Run static type checking via `astro check` |
| `npm test` | Execute full unit test suite (>2,200 tests via Vitest) |
| `npm run test:watch` | Run Vitest in interactive watch mode |
| `npm run test:e2e` | Run automated Playwright end-to-end browser tests |
| `npm run build` | Produce production-ready static assets in `dist/` with link checking |
| `npm run preview` | Locally preview the generated production build |
| `npm run og:images` | Regenerate OpenGraph social share card images |

---

## 👤 Author & Contact

- **Author:** **Nguyễn Hoàng Tùng**
- **GitHub:** [@Luffyreals](https://github.com/Luffyreals)
- **Email:** [hoangtungcnh@gmail.com](mailto:hoangtungcnh@gmail.com)
- **Project Site:** [https://ai-atlas-7nb.pages.dev/](https://ai-atlas-7nb.pages.dev/)

For inquiries, academic discussions, or suggestions, feel free to reach out via email or open an [Issue on GitHub](https://github.com/Luffyreals/ai-atlas/issues).

---

## 📄 License

AI Atlas is released under a dual-licensing scheme:

- 💻 **Source Code:** Distributed under the **[MIT License](../LICENSE)**. You are free to inspect, adapt, and build upon the software architecture for personal or commercial use.
- 📖 **Content & Diagrams:** Distributed under **[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/)**. You may share and adapt the material provided appropriate attribution is given to the author, the work is not used for commercial purposes, and modifications are distributed under the same license.
