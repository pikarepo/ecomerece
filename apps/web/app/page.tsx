import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Storefront</h1>
      <p className="text-sm text-ink-2">Under construction.</p>
      <Link
        href="/design"
        className="mat-primary inline-flex min-h-11 items-center gap-2 rounded-control px-5 text-sm font-semibold text-accent-ink transition-all duration-skin ease-skin active:scale-[var(--press-scale)]"
      >
        Design gallery →
      </Link>
    </main>
  );
}
