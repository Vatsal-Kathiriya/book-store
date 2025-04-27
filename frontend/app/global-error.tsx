'use client';

import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="container-page flex flex-col items-center justify-center py-16 text-center min-h-screen">
          <h1 className="text-3xl font-bold mb-6">Something went wrong!</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg">
            We apologize for the inconvenience. An unexpected error has occurred.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={reset}
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Try again
            </button>
            <Link
              href="/"
              className="border border-gray-300 dark:border-gray-600 px-6 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Return home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
