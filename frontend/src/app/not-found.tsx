import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="space-y-4 max-w-md">
        <h2 className="text-4xl font-extrabold tracking-tight">404</h2>
        <h3 className="text-xl font-semibold">Page Not Found</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          The page or route you are looking for does not exist.
        </p>
        <div>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
