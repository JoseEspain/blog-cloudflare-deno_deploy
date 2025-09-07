import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#374151',
            a: { color: '#0ea5e9', textDecoration: 'none', fontWeight: '500', '&:hover': { textDecoration: 'underline', color: '#0284c7' } },
            'h1, h2, h3, h4': { color: '#111827', fontWeight: '700' },
            pre: { backgroundColor: '#1f2937', color: '#e5e7eb', padding: '1.25rem', borderRadius: '0.75rem' },
            code: { color: '#0ea5e9', backgroundColor: '#f0f9ff', padding: '0.2em 0.4em', borderRadius: '0.375rem', fontWeight: '500' },
            'pre code': { backgroundColor: 'transparent', padding: '0', color: 'inherit', fontWeight: 'inherit' },
            blockquote: { borderLeftColor: '#e0f2fe', backgroundColor: '#f0f9ff', padding: '1rem 1.5rem', borderRadius: '0.5rem' },
            'thead th': { color: '#111827', fontWeight: '600', padding: '0.75em', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' },
            'tbody td': { padding: '0.75em', borderBottom: '1px solid #e5e7eb' },
            'tbody tr:nth-child(even)': { backgroundColor: '#f9fafb' },
          },
        },
        invert: {
          css: {
            color: '#9ca3af',
            a: { color: '#93c5fd', '&:hover': { color: '#60a5fa' } },
            'h1, h2, h3, h4': { color: '#f3f4f6', fontWeight: '700' },
            strong: { color: '#f3f4f6' },
            pre: { backgroundColor: '#111827', color: '#e5e7eb' },
            code: { color: '#93c5fd', backgroundColor: '#1e3a8a' },
            'pre code': { backgroundColor: 'transparent', padding: '0', color: 'inherit', fontWeight: 'inherit' },
            blockquote: { color: '#d1d5db', borderLeftColor: '#1e3a8a', backgroundColor: '#1e3a8a' },
            'thead th': { color: '#f3f4f6', borderBottomColor: '#374151', backgroundColor: '#1f2937' },
            'tbody td': { borderBottomColor: '#374151' },
            'tbody tr:nth-child(even)': { backgroundColor: '#1f2937' },
          },
        },
      },
    },
  },
  plugins: [typography()],
}
