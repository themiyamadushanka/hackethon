'use client';

import React, { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/api/v1/music`;

interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: string;
}

export default function MusicPlaylist() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch playlist');
      const data = await res.json();
      setSongs(data);
    } catch (err: any) {
      setError(err.message || 'Cannot connect to music service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) return;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          artist: artist.trim(),
          genre: genre.trim() || 'General',
          duration: duration.trim() || '3:00',
        }),
      });
      if (!res.ok) throw new Error('Failed to add song');
      const newSong = await res.json();
      setSongs((prev) => [...prev, newSong]);
      setTitle('');
      setArtist('');
      setGenre('');
      setDuration('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRemoveSong = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove song');
      setSongs((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6" suppressHydrationWarning>
      {/* Add Song Form */}
      <form
        onSubmit={handleAddSong}
        className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 shadow-sm"
      >
        <h2 className="text-lg font-semibold">Add Song to Playlist</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Song Title (required)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="text"
            placeholder="Artist Name (required)"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="text"
            placeholder="Genre (e.g. Pop, R&B)"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            placeholder="Duration (e.g. 3:45)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium text-sm transition-colors"
          >
            + Add to Playlist
          </button>
        </div>
      </form>

      {/* Playlist */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">🎵 Playlist ({songs.length} songs)</h2>
          {loading && <span className="text-xs text-zinc-500">Loading playlist...</span>}
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-sm mb-3">
            {error} (Make sure backend is running on port 5000)
          </div>
        )}

        {songs.length === 0 && !loading ? (
          <p className="text-zinc-500 text-sm py-8 text-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded">
            No songs in playlist yet. Add one above!
          </p>
        ) : (
          <div className="space-y-2">
            {songs.map((song, index) => (
              <div
                key={song.id}
                className="p-4 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <span className="text-zinc-400 text-sm font-mono w-6 text-center">{index + 1}</span>
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 text-lg font-bold flex-shrink-0">
                    ♪
                  </div>
                  <div>
                    <h3 className="font-medium text-base">{song.title}</h3>
                    <p className="text-sm text-zinc-500">{song.artist}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col items-end gap-0.5">
                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {song.genre}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">{song.duration}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveSong(song.id)}
                    className="px-3 py-1 text-xs text-red-600 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 rounded"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
