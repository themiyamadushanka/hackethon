import Navbar from '@/components/Navbar';
import TaskList from '@/components/TaskList';

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col" suppressHydrationWarning>
      <Navbar />
      <div className="max-w-4xl w-full mx-auto px-4 py-8 flex-1" suppressHydrationWarning>
        <TaskList />
      </div>
    </main>
  );
}
