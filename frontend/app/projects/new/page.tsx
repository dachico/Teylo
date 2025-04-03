// app/projects/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';

export default function NewProjectPage() {
  const [prompt, setPrompt] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a game description');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await apiRequest<{ data: { _id: string } }>(
        '/projects', 
        'POST', 
        { 
          prompt, 
          name: name.trim() || undefined 
        }
      );
      
      router.push(`/projects/${response.data._id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      setError('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create New Game</h1>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Project Name (Optional)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="My Awesome Game"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                If left blank, a name will be generated based on your prompt
              </p>
            </div>
            
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                Game Description
              </label>
              <div className="mt-1">
                <textarea
                  id="prompt"
                  rows={6}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Describe the game you want to create. For example: A first-person shooter game set in a futuristic space station with alien enemies and laser weapons."
                  required
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Be as descriptive as possible about the type of game, gameplay mechanics, visual style, and any specific features you want.
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-75"
              >
                {isSubmitting ? 'Creating...' : 'Create Game'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}