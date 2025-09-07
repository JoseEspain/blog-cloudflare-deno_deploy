# Blog-cloudflare-deno_deploy

[English](README-en.md) | 中文

这是一个基于 Astro、Hono 和 Preact 构建的现代化技术博客项目，支持**中英文双语**和**Cloudflare** 与 **Deno Deploy**双平台部署。

---

### ✨ 主要功能

- **🌐 国际化支持**: 完整的中英文双语支持，基于 Astro 内置 i18n 功能
- **🚀 双平台部署**: 支持 Cloudflare Pages & Workers 和 Deno Deploy 双平台部署
- **📝 内容管理**: Markdown/MDX 文章格式，支持交互式组件和数学公式
- **🧮 工程计算工具示例**: 
  - 顶管管顶土压力计算器（符合 T/CECS 1113-2022 规范）
  - 支持导出含可编辑数学公式的 DOCX 计算书
  - 可复用的表单组件系统，便于开发新的计算工具
- **🤖 AI 聊天示例**: 集成 OpenAI 兼容 API 的流式聊天界面
- **🎨 现代化体验**: 
  - 明暗模式切换
  - 响应式设计
  - 全文搜索功能
  - 流畅的用户界面动画

### 🛠️ 技术栈

- **前端框架**: 
  - [Astro](https://astro.build/) - 静态站点生成器，支持内置国际化
  - [Preact](https://preactjs.com/) - 轻量级 React 替代品，用于交互组件
  - [Preact Signals](https://preactjs.com/guide/v10/signals/) - 响应式状态管理
- **样式系统**: [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- **后端 API**: [Hono](https://hono.dev/) - 轻量级边缘计算 Web 框架
- **内容处理**:
  - [Unified](https://unifiedjs.com/) - Markdown/MDX 处理管道
  - [KaTeX](https://katex.org/) - 数学公式渲染
  - [Remark](https://remark.js.org/) & [Rehype](https://rehype.js.org/) - 内容转换插件
- **文档生成**: [docx](https://docx.js.org/) - DOCX 文件生成
- **部署平台**:
  - [Cloudflare Pages & Workers](https://pages.cloudflare.com/)
  - [Deno Deploy](https://deno.com/deploy)
- **开发环境**: [Node.js](https://nodejs.org/) (构建) & [Deno](https://deno.land/) (API 服务器)

### 🏗️ 项目架构

本项目采用“**前端静态生成 + 后端多平台适配**”的现代架构，前端使用 Astro 构建纯静态文件，后端 API (Hono) 核心逻辑是平台无关的，通过不同的“适配器”文件部署到 Cloudflare 或 Deno Deploy，实现了一次编码、双平台部署。 

- **本地开发 (`npm run dev`)**:
  
  1. `concurrently` 同时启动两个服务。
  2. 浏览器从 Astro 开发服务器 (`localhost:4321`) 加载前端页面。
  3. `AIChat` 组件通过绝对路径 (`http://localhost:8787/chat`) 向 Deno API 服务器发起 `fetch` 请求。

- **生产环境 (Cloudflare)**:
  
  1. 用户访问 `yoursite.pages.dev`。
  2. Cloudflare Pages 从其静态资源服务返回页面。
  3. `AIChat` 组件向相对路径 `/chat` 发起 `fetch` 请求。
  4. Cloudflare Pages 将此请求路由到 `functions/chat.ts` 中部署的集成函数进行处理。

- **生产环境 (Deno Deploy)**:
  
  1. 用户访问 `yoursite.deno.dev`。
  2. `api/deno.ts` 中运行的 Hono 服务器接收所有请求。
  3. 如果是页面请求 (`GET`)，则从 `dist` 目录中返回对应的静态文件。
  4. 如果是 API 请求 (`POST /chat`)，则执行 Hono 的 API 逻辑。#### 

### 🚀 本地开发

1. **克隆仓库**
   
   ```bash
   git clone https://github.com/zero456/Blog-cloudflare-deno_deploy
   cd Blog-cloudflare-deno_deploy
   ```

2. **安装依赖**
   
   ```bash
   npm install
   ```

3. **配置环境变量**
   
   - 在项目根目录创建一个 `.env` 文件，必须的，否则会运行出错。
   
   - 复制以下内容并填入您的 API 密钥、端点和模型名称。
     
     ```env
     # API密钥
     API_KEY="your-api-key"
     
     # API端点基础URL (例如: https://api.openai.com/v1)
     API_BASE_URL="your-api-base-url"
     
     # 使用的AI模型名称 (例如: gpt-4o-mini)
     AI_MODEL_NAME="your-model-name"
     ```

4. **启动开发服务器**
   
   ```bash
   npm run dev
   ```
   
   此命令会同时启动两个服务：
   
   - Astro 前端服务 (通常在 `http://localhost:4321`)
   - Deno API 后端服务 (在 `http://localhost:8787`)
   
   打开浏览器访问 Astro 的地址即可开始开发和调试。

### 部署

本项目支持多种部署方式。

#### 1. 通过 Cloudflare Pages 仪表板部署 (推荐)

这是目前项目实际采用的部署方式。直接在 Cloudflare Pages 平台设置，无需使用 CI/CD 配置文件。

部署案例：[https://blog-fyx.pages.dev](https://blog-fyx.pages.dev)

1. **连接 GitHub 仓库**: 在 Cloudflare Pages 仪表板中，选择"连接到 Git"，然后授权并选择此项目的 GitHub 仓库。
2. **配置构建设置**:
   * **框架预设**: 选择 `Astro`。Cloudflare 会自动填充大部分构建设置。
   * **环境变量**: 这是最关键的一步。在 `设置 > 环境变量` 中，添加生产环境变量，特别是 AI 模型相关的变量 (例如 `API_KEY`, `API_BASE_URL`, `MODEL_NAME` 等)。
3. **保存并部署**: Cloudflare 会自动拉取代码、构建并完成部署。后续推送到 `main` 分支的提交将自动触发新的部署。

#### 2. 通过 Deno Deploy 平台部署

您也可以直接通过 Deno Deploy 平台进行部署，无需配置 GitHub Actions。

部署案例：[https://blog-fyx.deno.dev](https://blog-fyx.deno.dev)

1. **连接 GitHub 仓库**: 在 [Deno Deploy](https://deno.com/deploy) 仪表板中，创建新项目并连接到此 GitHub 仓库。
2. **配置项目设置**:
   * **入口文件**: 选择 `api/deno.ts`
   * **生产分支**: 选择 `main`
3. **配置环境变量**: 在项目设置中添加必要的环境变量：
   * `API_KEY`: 您的 API 密钥。
   * `API_BASE_URL`: API 端点基础 URL。
   * `AI_MODEL_NAME`: 要使用的 AI 模型名称。
4. **部署**: Deno Deploy 会自动构建并部署项目。后续推送到 `main` 分支的提交将自动触发新的部署。

### 🌐 国际化支持

本项目支持完整的中英文双语功能：

#### URL 结构

- **中文版本**: `https://yoursite.com/` (默认，无语言前缀)
- **英文版本**: `https://yoursite.com/en/`

#### 语言切换

- 导航栏右上角提供语言切换下拉菜单
- 自动保持当前页面上下文进行语言切换
- 支持 SEO 友好的独立 URL

### 📝 内容管理

#### 添加中文文章

在 `src/content/blog/` 目录下创建 `.md` 或 `.mdx` 文件：

```markdown
---
title: 文章标题
published_at: 2024-01-01
blurb: 文章简介
tags: ["标签1", "标签2"]
isPinned: false  # 可选，是否置顶
layoutMode: 'document'  # 可选：'document' | 'app' | 'homepage'
---

# 文章内容

这里是文章的 Markdown 内容...
```

#### 添加英文文章

英文文章需要在文件名后添加 `-en` 后缀：

```markdown
<!-- 文件名：src/content/blog/article-name-en.mdx -->
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

#### 文章类型

- **普通文章** (`layoutMode: 'document'`): 标准博客文章布局
- **应用页面** (`layoutMode: 'app'`): 全屏应用布局，适用于计算器、聊天等工具
- **首页布局** (`layoutMode: 'homepage'`): 特殊首页布局

#### 交互式组件示例

在 MDX 文章中可以直接使用 React/Preact 组件：

[顶管管顶竖向土压力计算器](blob/main/src/content/blog/pipe-pressure.mdx)

[AI 聊天](blob/main/src/content/blog/ai-chat.mdx)

[KaTeX 渲染及转换工具](blob/main/src/content/blog/mathml.mdx)

### 📜 主要 NPM 脚本

- `npm run dev`: 启动完整的本地开发环境（同时启动前端和后端）
- `npm run dev:astro`: 单独启动 Astro 前端开发服务器
- `npm run dev:api`: 单独启动 Deno 后端 API 服务器
- `npm run build`: 构建用于生产的静态网站文件
- `npm run preview`: 在本地预览构建好的静态网站
- `npm run test`: 运行测试套件 

### 🔧 项目结构

```
src/
├── components/          # React/Preact 组件
│   ├── form/           # 可复用表单组件
│   ├── AIChat.tsx      # AI 聊天组件
│   ├── BlogList.tsx    # 博客列表组件
│   └── ...
├── content/            # 内容管理
│   └── blog/          # 博客文章
├── i18n/              # 国际化
│   ├── ui.ts          # 翻译文件
│   └── utils.ts       # 国际化工具函数
├── layouts/           # 页面布局
├── pages/             # 页面路由
│   ├── en/            # 英文页面
│   └── ...
└── utils/             # 工具函数
```

### 🎨 设计系统

- **响应式设计**: 移动端优先，适配各种屏幕尺寸
- **深色模式**: 完整的深色主题支持
- **动画效果**: 流畅的过渡动画和交互反馈
- **无障碍访问**: 符合 WCAG 标准的可访问性设计

### 📊 性能优化

- **静态生成**: Astro 静态站点生成，极快的加载速度
- **代码分割**: 组件级别的代码分割和懒加载
- **边缘计算**: 利用 Cloudflare 和 Deno Deploy 的边缘网络
- **缓存策略**: 智能的静态资源缓存和 CDN 分发
  
  ### 
  
  🤝 贡献指南

欢迎贡献代码、报告问题或提出改进建议！

#### 开发流程

1. Fork 本仓库
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 提交 Pull Request

#### 代码规范

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 和 Prettier 配置
- 组件和函数需要适当的注释
- 提交信息使用英文，格式清晰

#### 添加新功能

- **新的计算工具**: 参考 `PipePressureCalculator.tsx` 的模板结构
- **新的组件**: 放置在 `src/components/` 目录下
- **国际化**: 在 `src/i18n/ui.ts` 中添加对应的翻译
- **文档**: 更新 README 和相关文档

### 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

- [English License](LICENSE)
- [中文许可证](LICENSE-zh.md)

### 🙏 致谢

- [Astro](https://astro.build/) - 现代化的静态站点生成器
- [Hono](https://hono.dev/) - 轻量级 Web 框架
- [Preact](https://preactjs.com/) - 高性能的 React 替代品
- [Deno](https://deno.land/) - 现代化的 JavaScript/TypeScript 运行时
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [KaTeX](https://katex.org/) - 快速的数学公式渲染
- [docx.js](https://docx.js.org/) - 强大的 DOCX 文档生成库
- [Cloudflare](https://cloudflare.com/) & [Deno Deploy](https://deno.com/deploy) - 优秀的部署平台

### 📞 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 [GitHub Issue](https://github.com/zero456/blog-cloudflare-deno_deploy/issues)
- 发起 [GitHub Discussion](https://github.com/zero456/blog-cloudflare-deno_deploy/discussions)

---

**Happy Coding! 🚀**