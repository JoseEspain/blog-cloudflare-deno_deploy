# Blog-cloudflare-deno_deploy

English | [中文](README.md)

A modern technical blog project built with Astro, Hono, and Preact, featuring **bilingual support (Chinese/English)** and **dual-platform deployment** (Cloudflare & Deno Deploy).

---

### ✨ Key Features

- **🌐 Internationalization**: Complete bilingual support (Chinese/English) based on Astro's built-in i18n functionality
- **🚀 Dual Platform Deployment**: Support for both Cloudflare Pages & Workers and Deno Deploy
- **📝 Content Management**: Markdown/MDX article format with interactive components and mathematical formulas
- **🧮 Engineering Calculation Tools**: 
  - Pipe jacking earth pressure calculator (compliant with T/CECS 1113-2022 standards)
  - Export calculation reports with editable mathematical formulas in DOCX format
  - Reusable form component system for developing new calculation tools
- **🤖 AI Chat**: Streaming chat interface integrated with OpenAI-compatible APIs
- **🎨 Modern Experience**: 
  - Dark/light mode toggle
  - Responsive design
  - Full-text search functionality
  - Smooth UI animations

### 🛠️ Tech Stack

- **Frontend Framework**: 
  - [Astro](https://astro.build/) - Static site generator with built-in internationalization
  - [Preact](https://preactjs.com/) - Lightweight React alternative for interactive components
  - [Preact Signals](https://preactjs.com/guide/v10/signals/) - Reactive state management
- **Styling System**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Backend API**: [Hono](https://hono.dev/) - Lightweight edge computing web framework
- **Content Processing**:
  - [Unified](https://unifiedjs.com/) - Markdown/MDX processing pipeline
  - [KaTeX](https://katex.org/) - Mathematical formula rendering
  - [Remark](https://remark.js.org/) & [Rehype](https://rehype.js.org/) - Content transformation plugins
- **Document Generation**: [docx.js](https://docx.js.org/) - DOCX file generation
- **Deployment Platforms**:
  - [Cloudflare Pages & Workers](https://pages.cloudflare.com/)
  - [Deno Deploy](https://deno.com/deploy)
- **Development Environment**: [Node.js](https://nodejs.org/) (build) & [Deno](https://deno.land/) (API server)

### 🏗️ Project Architecture

This project adopts a modern architecture of "**frontend static generation + backend multi-platform adaptation**". The frontend uses Astro to build pure static files, while the backend API (Hono) core logic is platform-agnostic, deployed to Cloudflare or Deno Deploy through different "adapter" files, achieving one codebase for dual-platform deployment.

- **Local Development (`npm run dev`)**:
  
  1. `concurrently` starts two services simultaneously.
  2. Browser loads frontend pages from Astro dev server (`localhost:4321`).
  3. `AIChat` component makes `fetch` requests to Deno API server via absolute path (`http://localhost:8787/chat`).

- **Production Environment (Cloudflare)**:
  
  1. Users visit `yoursite.pages.dev`.
  2. Cloudflare Pages returns pages from its static resource service.
  3. `AIChat` component makes `fetch` requests to relative path `/chat`.
  4. Cloudflare Pages routes this request to integrated functions deployed in `functions/chat.ts`.

- **Production Environment (Deno Deploy)**:
  
  1. Users visit `yoursite.deno.dev`.
  2. Hono server running in `api/deno.ts` receives all requests.
  3. For page requests (`GET`), returns corresponding static files from `dist` directory.
  4. For API requests (`POST /chat`), executes Hono's API logic.

### 🚀 Local Development

1. **Clone Repository**
   
   ```bash
   git clone https://github.com/zero456/Blog-cloudflare-deno_deploy
   cd Blog-cloudflare-deno_deploy
   ```

2. **Install Dependencies**
   
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   
   - Create a `.env` file in the project root directory.
   
   - Copy the following content and fill in your API keys, endpoints, and model names.
     
     ```env
     # API Key
     API_KEY="your-api-key"
     
     # API endpoint base URL (e.g., https://api.openai.com/v1)
     API_BASE_URL="your-api-base-url"
     
     # AI model name to use (e.g., gpt-4o-mini)
     AI_MODEL_NAME="your-model-name"
     ```

4. **Start Development Server**
   
   ```bash
   npm run dev
   ```
   
   This command starts two services simultaneously:
   
   - Astro frontend service (usually at `http://localhost:4321`)
   - Deno API backend service (at `http://localhost:8787`)
   
   Open your browser and visit the Astro address to start development and debugging.

### Deployment

This project supports two deployment methods.

#### 1. Deploying via Cloudflare Pages Dashboard

This is the current and recommended deployment method. You can set up the project directly on the Cloudflare Pages platform without needing a CI/CD configuration file.

1. Connect to your Git repository: In your Cloudflare Pages dashboard, select "Connect to Git," then authorize and choose this project's GitHub repository.
2. Configure build settings:
   * **Framework preset**: Select `Astro`. Cloudflare will automatically pre-populate most of the build settings.
   * **Build command**: `npm run build`
   * **Build output directory**: `dist`
   * **Root directory**: Leave this field empty.
3. Configure environment variables: In your project settings, add the necessary environment variables as plain text.
   * **API_KEY**: Your API key.
   * **API_BASE_URL**: The base URL for your API endpoint.
   * **AI_MODEL_NAME**: The name of the AI model to use.
   * **ADAPTER_TYPE**: cloudflare
4. **Save and Deploy**: Cloudflare will automatically pull code, build, and complete deployment. Subsequent commits pushed to the `main` branch will automatically trigger new deployments.

#### 2. Deploy via Deno Deploy Platform

You can also deploy directly through the Deno Deploy platform without configuring GitHub Actions.

1. **Connect GitHub Repository**: In the [Deno Deploy](https://deno.com/deploy) dashboard, create a new project and connect to this GitHub repository.
2. **Configure Project Settings**:
   * **Framework preset**: Select `Astro`
   * **Install Step**: Enter `npm install`
   * **Build Step**: Enter `npm run build`
   * **Root directory**: Enter `dist`
   * **Entry File**: Select `api/deno.ts`
   * **Production Branch**: Select `main`
3. **Configure Environment Variables**: Add necessary environment variables in project settings:
   * `API_KEY`: Your API key.
   * `API_BASE_URL`: API endpoint base URL.
   * `AI_MODEL_NAME`: AI model name to use.
4. **Deploy**: Deno Deploy will automatically build and deploy the project. Subsequent commits pushed to the `main` branch will automatically trigger new deployments.

### 🌐 Internationalization Support

This project supports complete bilingual functionality in Chinese and English:

#### URL Structure
- **Chinese Version**: `https://yoursite.com/` (default, no language prefix)
- **English Version**: `https://yoursite.com/en/`

#### Language Switching
- Language toggle dropdown menu in the top-right corner of the navigation bar
- Automatically maintains current page context during language switching
- Supports SEO-friendly independent URLs

### 📝 Content Management

#### Adding Chinese Articles
Create `.md` or `.mdx` files in the `src/content/blog/` directory:

```markdown
---
title: Article Title
published_at: 2024-01-01
blurb: Article description
tags: ["Tag1", "Tag2"]
isPinned: false  # Optional, whether to pin
layoutMode: 'document'  # Optional: 'document' | 'app' | 'homepage'
---

# Article Content

This is the Markdown content of the article...
```

#### Adding English Articles
English articles need to add `-en` suffix to the filename:

```markdown
<!-- Filename: src/content/blog/article-name-en.mdx -->
---
title: Article Title
published_at: 2024-01-01
blurb: Article description
tags: ["Tag1", "Tag2"]
isPinned: false
layoutMode: 'document'
---

# Article Content

English article content here...
```

#### Article Types
- **Regular Articles** (`layoutMode: 'document'`): Standard blog article layout
- **Application Pages** (`layoutMode: 'app'`): Full-screen application layout, suitable for AI-chat
- **Homepage Layout** (`layoutMode: 'homepage'`): Special homepage layout

#### Interactive Components sample
You can directly use React/Preact components in MDX articles:

[Calculates Earth Pressure on Jacking Pipe with Web preview and Docx export](src/content/blog/pipe-pressure-en.mdx)

[AI Chat](src/content/blog/ai-chat-en.mdx)

[KaTeX Renderer & convert](src/content/blog/mathml-en.mdx)

### 📜 Main NPM Scripts

- `npm run dev`: Start complete local development environment (start both frontend and backend simultaneously)
- `npm run dev:astro`: Start Astro frontend development server only
- `npm run dev:api`: Start Deno backend API server only
- `npm run build`: Build static website files for production
- `npm run preview`: Preview built static website locally
- `npm run test`: Run test suite

### 🔧 Project Structure

```
src/
├── components/          # React/Preact components
│   ├── form/           # Reusable form components
│   ├── AIChat.tsx      # AI chat component
│   ├── BlogList.tsx    # Blog list component
│   └── ...
├── content/            # Content management
│   └── blog/          # Blog articles
├── i18n/              # Internationalization
│   ├── ui.ts          # Translation files
│   └── utils.ts       # Internationalization utility functions
├── layouts/           # Page layouts
├── pages/             # Page routing
│   ├── en/            # English pages
│   └── ...
└── utils/             # Utility functions
```

### 🎨 Design System

- **Responsive Design**: Mobile-first, adapts to various screen sizes
- **Dark Mode**: Complete dark theme support
- **Animation Effects**: Smooth transition animations and interactive feedback
- **Accessibility**: WCAG-compliant accessible design

### 📊 Performance Optimization

- **Static Generation**: Astro static site generation for extremely fast loading speeds
- **Code Splitting**: Component-level code splitting and lazy loading
- **Edge Computing**: Leverage edge networks of Cloudflare and Deno Deploy
- **Caching Strategy**: Intelligent static resource caching and CDN distribution

### 🤝 Contributing Guide

We welcome code contributions, issue reports, and improvement suggestions!

#### Development Process
1. Fork this repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Submit Pull Request

#### Code Standards
- Use TypeScript for type-safe development
- Follow ESLint and Prettier configurations
- Components and functions need appropriate comments
- Commit messages in English with clear formatting

#### Adding New Features
- **New Calculation Tools**: Refer to the template structure of `PipePressureCalculator.tsx`
- **New Components**: Place in `src/components/` directory
- **Internationalization**: Add corresponding translations in `src/i18n/ui.ts`
- **Documentation**: Update README and related documentation

### 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

### 🙏 Acknowledgments

- [Astro](https://astro.build/) - Modern static site generator
- [Hono](https://hono.dev/) - Lightweight web framework
- [Preact](https://preactjs.com/) - High-performance React alternative
- [Deno](https://deno.land/) - Modern JavaScript/TypeScript runtime
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [KaTeX](https://katex.org/) - Fast mathematical formula rendering
- [docx.js](https://docx.js.org/) - Powerful DOCX document generation library
- [Cloudflare](https://cloudflare.com/) & [Deno Deploy](https://deno.com/deploy) - Excellent deployment platforms

---

*"The Next Syntax for Civil Engineering" - where traditional engineering meets modern innovation, capturing gleanings and glimmers of insight along the way.*

### 📞 Contact

If you have questions or suggestions, feel free to contact us through:

- Submit [GitHub Issue](https://github.com/zero456/blog-cloudflare-deno_deploy/issues)
- Start [GitHub Discussion](https://github.com/zero456/blog-cloudflare-deno_deploy/discussions)

---

**Happy Coding! 🚀**