import React from 'react';
import Navbar from '@/components/Navbar';
import VisionChat from '@/components/VisionChat';

export const metadata = {
  title: 'AgroVision AI - Plant Leaf Disease & Crop Health Doctor',
  description: 'Upload crop leaf photos to detect fungal blights, rust, mildew, and get organic remedies using Azure Computer Vision.',
};

export default function VisionChatPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      <Navbar />
      <div className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-6 flex flex-col">
        <VisionChat />
      </div>
    </main>
  );
}
