import React from 'react';
import Navbar from '@/components/Navbar';
import VisionChat from '@/components/VisionChat';

export const metadata = {
  title: 'Vision Chat - Prescription AI Scanner',
  description: 'Upload prescriptions and medical documents to extract text and dosage instructions using Azure Computer Vision.',
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
