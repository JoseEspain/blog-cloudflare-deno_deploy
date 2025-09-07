// functions/chat.ts

// 从 Cloudflare 的类型库中导入 PagesFunction 类型，以获得更好的类型提示和安全
import type { PagesFunction } from '@cloudflare/workers-types';

// 从正确的位置导入共享的 Hono app
import app from '../api/src/index';

// 创建一个 onRequest 函数，这是 Cloudflare Pages Functions 的标准入口点
// 它接收请求上下文(context)，并将其传递给 Hono app 的 fetch 方法来处理
export const onRequest: PagesFunction = (context) => {
  return app.fetch(context.request, context.env, context);
};