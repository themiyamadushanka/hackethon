import Navbar from '@/components/Navbar';
import MusicPlaylist from '@/components/MusicPlaylist';

export default function MusicPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col" suppressHydrationWarning>
      <Navbar />
      <div className="max-w-4xl w-full mx-auto px-4 py-8 flex-1" suppressHydrationWarning>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">🎵 Music Playlist</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your team playlist — add and remove songs from the backend.</p>
        </div>
        <MusicPlaylist />
      </div>
    </main>
  );
}
