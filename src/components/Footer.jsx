import React from 'react';
import { Link } from '@heroui/react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm font-semibold text-text-soft">
          © {new Date().getFullYear()} Pharmora. Open Pharmacy Learning Network.
        </div>
        <div className="flex gap-6">
          <Link href="/about/" className="text-xs text-text-muted hover:text-primary">About</Link>
          <Link href="/docs/" className="text-xs text-text-muted hover:text-primary">API Docs</Link>
          <Link href="https://github.com/himshim/pharmora" className="text-xs text-text-muted hover:text-primary">GitHub</Link>
        </div>
      </div>
    </footer>
  );
}
