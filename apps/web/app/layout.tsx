import { BlurGovernor, ToastProvider } from '@ecomerece/ui';
import { bootstrapScript } from '@ecomerece/ui/skin';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ecomerece',
  description: 'Storefront',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F1F5F9' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0F17' },
  ],
};

// §38.2 — inline before any stylesheet, no flash of theme, skin or fidelity.
// The skin id is validated against ^[a-z0-9-]{1,32}$ inside the script.
const skinBase = '/skins/';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* §37/38.1: system.css is ALWAYS loaded (base fallback + the default skin's vars) */}
        <link rel="stylesheet" href="/skins/system.css" />
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static string, required inline before paint per DESIGN.md §38.2 */}
        <script dangerouslySetInnerHTML={{ __html: bootstrapScript(skinBase) }} />
      </head>
      {/* The `--scene` background is painted by <body> (tokens.css, §G8). No
          separate fixed backdrop layer: it would sit behind the body canvas
          anyway and only add a full-viewport composited paint. */}
      <body className="font-sans text-ink antialiased">
        <BlurGovernor />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
