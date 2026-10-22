import React from 'react';

export default function Navbar() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold">⚡ My Hackathon App</h1>
      <span className="text-xs px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono">
        Frontend + Express Backend
      </span>
    </header>
  );
}
