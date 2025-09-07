/**
 * @file api/deno.ts
 * @description Deno Deploy server entry point. Combines API routes with static file serving.
 * This file serves as the main server implementation for Deno Deploy, handling both
 * API requests and static file serving in a single Hono application.
 */

import { Hono } from 'hono';
import "https://deno.land/std/dotenv/load.ts";

import api from './src/index.ts'; // Import the core API app

const app = new Hono();

// Mount the API routes. The /chat route from our api app will be available.
app.route('/', api);

// Determine the correct base path for static files by checking common locations
async function getStaticFilesBasePath(): Promise<string> {
  const possiblePaths = ['', '/src'];

  for (const basePath of possiblePaths) {
    try {
      await Deno.stat(basePath + '/index.html');
      return basePath;
    } catch {
      // Continue to next path
    }
  }

  return '';
}

// Serve static files with intelligent path handling
app.get('*', async (c) => {
  // Get the base path where static files are actually located
  const basePath = await getStaticFilesBasePath();

  let filePath = c.req.path;

  // Handle root path
  if (filePath === '/') {
    filePath = '/index.html';
  }
  // Handle paths that should map to directories (for SPA routing)
  else if (!filePath.includes('.') && !filePath.endsWith('/')) {
    filePath += '/';
  }

  // Handle directory paths (e.g., /about/ -> /about/index.html)
  if (filePath.endsWith('/')) {
    filePath += 'index.html';
  }

  // Construct the full path to the file
  const fullPath = basePath + filePath;

  try {
    // Try to serve the static file
    const file = await Deno.open(fullPath, { read: true });
    const fileInfo = await Deno.stat(fullPath);
    const headers = new Headers();
    headers.set('Content-Length', fileInfo.size.toString());

    // Simple content type detection based on file extension
    if (fullPath.endsWith('.html')) {
      headers.set('Content-Type', 'text/html; charset=utf-8');
    } else if (fullPath.endsWith('.css')) {
      headers.set('Content-Type', 'text/css');
    } else if (fullPath.endsWith('.js')) {
      headers.set('Content-Type', 'application/javascript');
    } else if (fullPath.endsWith('.ico')) {
      headers.set('Content-Type', 'image/x-icon');
    } else if (fullPath.endsWith('.png')) {
      headers.set('Content-Type', 'image/png');
    } else if (fullPath.endsWith('.jpg') || fullPath.endsWith('.jpeg')) {
      headers.set('Content-Type', 'image/jpeg');
    } else if (fullPath.endsWith('.svg')) {
      headers.set('Content-Type', 'image/svg+xml');
    } else if (fullPath.endsWith('.xml')) {
      headers.set('Content-Type', 'application/xml');
    } else if (fullPath.endsWith('.txt')) {
      headers.set('Content-Type', 'text/plain');
    } else {
      headers.set('Content-Type', 'application/octet-stream');
    }

    return new Response(file.readable, { headers });
  } catch (fileError) {
    if (fileError instanceof Deno.errors.NotFound) {
      // Fallback to index.html for SPA-like behavior
      try {
        const fallbackPath = basePath + '/index.html';
        const file = await Deno.open(fallbackPath, { read: true });
        const fileInfo = await Deno.stat(fallbackPath);
        const headers = new Headers();
        headers.set('Content-Length', fileInfo.size.toString());
        headers.set('Content-Type', 'text/html; charset=utf-8');
        return new Response(file.readable, { headers });
      } catch (indexError) {
        return new Response('File not found', { status: 404 });
      }
    }

    return new Response('Internal Server Error', { status: 500 });
  }
});

const port = parseInt(Deno.env.get("PORT") || "8787");

Deno.serve({ port }, app.fetch);