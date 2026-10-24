# AI Atlas

<!-- The CI badge only renders for viewers with access to the repository while it is private. -->
[![CI](https://github.com/Luffyreals/ai-atlas/actions/workflows/ci.yml/badge.svg)](https://github.com/Luffyreals/ai-atlas/actions/workflows/ci.yml)

[Tiếng Việt](../README.md) | **English**

> A map of AI knowledge: from Python basics to large language models, explained clearly, free for everyone.

AI Atlas is a **bilingual (Vietnamese – English)** wiki website. It brings together Artificial Intelligence knowledge and arranges it into **one clear learning path**: what to learn first, what comes next, and why.

## Why AI Atlas

There is no shortage of AI material, but beginners keep running into three problems:

- **No clear starting point.** Knowledge is scattered, with no order to follow.
- **Formulas without the "why".** Many resources show the math before the reader understands the problem.
- **Few good resources in Vietnamese.** Most high-quality material exists only in English.

AI Atlas places every lesson on a learning path with "prerequisite" links, and explains each concept **from intuition to math**.

## Highlights

- **Visual roadmap:** a map of all the topics. Click any topic to open its lesson.
- **From intuition to math:** each lesson starts with everyday examples, then works through the formulas step by step, then shows illustrations.
- **Interactive illustrations:** drag, drop and tweak parameters to *see* how a concept works.
- **Code that runs in the browser:** edit and run the Python examples, nothing to install.
- **Bilingual:** every lesson is available in Vietnamese and English.
- **Free, no sign-up:** your progress is saved in your own browser.

## What a lesson looks like

Every lesson follows the same structure, so you always know where you are:

1. **Goals:** what you will be able to do afterwards.
2. **Prerequisites:** links to the foundation lessons.
3. **Intuition:** understand the problem through examples, before any formula.
4. **Theory:** the formulas, explained step by step.
5. **Illustration:** a figure or an interactive visualization.
6. **Code example:** run it right on the page.
7. **Common mistakes:** frequent misunderstandings.
8. **Quick check:** a few multiple-choice questions.
9. **Summary and further reading:** key ideas and original sources.

## Contents

| Part | Main topics | Lessons |
|---|---|---|
| 1. Python | Syntax, data structures, OOP, Numpy, Pandas, Matplotlib | 7 |
| 2. Math for AI | Linear algebra, calculus, probability & statistics | 3 |
| 3. Machine Learning | Regression, classification, clustering, optimization, evaluation | 14 |
| 4. Deep Learning | Neural networks, CNN, RNN, LSTM, Transformers | 8 |
| 5a. NLP | Tokenizers, embeddings, BERT, GPT, language tasks | 13 |
| 5b. Computer Vision | Image classification, segmentation, CLIP, image generation, diffusion | 10 |
| 5c. LLM | Prompting, RAG, Agents, fine-tuning, RLHF/DPO, deployment | 23 |

After Part 4, you can continue with the **NLP**, **Computer Vision** or **LLM** track.

## Status

🚧 **Building the MVP:** the website framework and the first 5 Machine Learning lessons, in both languages.

| Milestone | Scope | Status |
|---|---|---|
| M0. Framework | Astro + Starlight, vi/en, KaTeX, the 78-lesson roadmap, unit and e2e tests, Cloudflare Pages deploy | Almost done: Cloudflare Pages deploy pending |
| M1. Lesson tools | Prerequisite list, quizzes, "mark as learned", in-page Python runner, roadmap map | In progress: roadmap map and the designed homepage are done |
| M2. Model lesson | The Linear Regression lesson, final lesson template | Not started |
| M3. First ML track | The other 4 Machine Learning lessons, in vi and en | Not started |
| M4. Launch | SEO, About page, mobile checks, custom domain | Not started |

| Document | Contents |
|---|---|
| [docs/mvp.md](mvp.md) | MVP spec: scope, acceptance criteria, milestones (Vietnamese) |
| [PLAN.md](PLAN.md) | Overall plan and phase progress (Vietnamese) |
| [CHANGELOG.md](CHANGELOG.md) | Changes made so far |
| [docs/](README.md) | Docs for lesson authors and developers (Vietnamese) |
| [docs/architecture/](architecture/README.md) | Technical architecture overview (Vietnamese) |

## Tech stack

- [Astro](https://astro.build) + [Starlight](https://starlight.astro.build): documentation site framework
- [MDX](https://mdxjs.com): lesson authoring format
- [React](https://react.dev): interactive components
- [KaTeX](https://katex.org): math rendering
- [Pyodide](https://pyodide.org): Python in the browser
- [Pagefind](https://pagefind.app): serverless search
- [Cloudflare Pages](https://pages.cloudflare.com): hosting

The site is fully static: no server, no database, no sign-in.

## Running locally

You need **Node.js 24.15.0** (pinned in [.node-version](../.node-version), minimum `>=22.23.4`) and npm.

```sh
git clone https://github.com/Luffyreals/ai-atlas.git
cd ai-atlas
npm install                      # install the pinned package versions
npx playwright install chromium  # browser for e2e tests, once per machine
npm run dev                      # open http://localhost:4321/vi/
```

Other commands:

| Command | What it does |
|---|---|
| `npm run build` | Build into `dist/`, checking internal links and i18n strings |
| `npm run preview` | Serve the build in `dist/` |
| `npm run check` | Type-check TypeScript (`astro check`) |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | E2E tests (Playwright); builds and starts the preview itself |

Full list and caveats: [CONTRIBUTING.md](../.github/CONTRIBUTING.md#các-lệnh) (Vietnamese).

## Project structure

```text
ai-atlas/
├─ src/       # website source: vi/en lessons, UI strings, roadmap (roadmap.ts), components
├─ public/    # static files: favicon, _redirects for Cloudflare Pages
├─ tests/     # unit tests (Vitest) and e2e tests (Playwright)
├─ docs/      # docs for lesson authors and developers
├─ .github/   # CI, Dependabot, issue and pull request templates
├─ .claude/   # the project's Claude Code sub agents
└─ .agents/   # UI design skill (third-party)
```

Configuration files live at the repo root: `astro.config.ts`, `package.json`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `.node-version`.

## Contributing

The project currently has a single maintainer. Feedback and bug reports are always welcome.

- Setup, commit conventions, the lesson workflow and the definition of done: [CONTRIBUTING.md](../.github/CONTRIBUTING.md) (Vietnamese).
- Website bugs, lesson errors or lesson requests: use the issue templates. You can write in English.
- Security issues: do **not** open a public issue; see [SECURITY.md](../.github/SECURITY.md#english).

## License

- **Content** (lessons, illustrations): [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). You may share and adapt it with attribution, for non-commercial purposes, under the same license.
- **Code** (website source, code examples): [MIT](../LICENSE).

See [LICENSE-CONTENT.md](LICENSE-CONTENT.md#english) for the exact scope of each license.
