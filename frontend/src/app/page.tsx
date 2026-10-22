import { Navbar } from '@/components/layout';
import { TaskList } from '@/features/tasks';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Architecture Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Developer Collaboration Architecture
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Modular Vertical Slice & Monorepo layout designed so multiple developers can build,
            test, and ship features without stepping on each other's code.
          </p>
        </div>

        {/* Feature Component */}
        <TaskList />
      </main>
    </div>
  );
}
