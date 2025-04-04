// app/projects/new/page.tsx
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, ProjectCreateResponse } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import { useNotification } from '@/contexts/NotificationContext';

export default function NewProjectPage() {
  const [prompt, setPrompt] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const { addNotification } = useNotification();

  // Example prompts for inspiration
  const examplePrompts = [
    "A first-person shooter game set on an abandoned space station where the player must fight alien parasites while solving puzzles to escape.",
    "A puzzle adventure game where the player can manipulate time to solve environmental challenges in an ancient temple.",
    "A racing game set in a futuristic city with hovercars that can drive on walls and ceilings.",
    "A platformer game where the main character can transform between different elemental forms to overcome obstacles.",
    "An adventure game set in a medieval fantasy world where players go on quests and solve mysteries in a village plagued by an ancient curse."
  ];

  // Apply an example prompt
  const applyExamplePrompt = (example: string) => {
    setPrompt(example);
    setShowExamples(false);
    // Focus and scroll to the end of the prompt
    if (promptRef.current) {
      promptRef.current.focus();
      promptRef.current.scrollTop = promptRef.current.scrollHeight;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a game description');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Show a loading overlay
      addNotification('info', 'Generating game design from your prompt. This may take a minute...', 0);
      
      const response = await apiRequest<ProjectCreateResponse>(
        '/projects', 
        'POST', 
        { 
          prompt, 
          name: name.trim() || undefined 
        }
      );
      
      // Show success notification
      addNotification('success', 'Game design created successfully!');
      
      // Navigate to the project detail page
      router.push(`/projects/${response.data._id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      setError('Failed to create project. Please try again with a different prompt.');
      addNotification('error', 'Failed to create the game. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Create New Game</h1>
          <p className="text-gray-600 mb-6">Describe what kind of game you want to create, and AI will generate a game design for you.</p>
          
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
              <div className="flex justify-between items-center">
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                  Game Description
                </label>
                <button
                  type="button"
                  onClick={() => setShowExamples(!showExamples)}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  {showExamples ? 'Hide' : 'Show'} Examples
                </button>
              </div>
              
              {showExamples && (
                <div className="mt-2 p-4 bg-indigo-50 rounded-md">
                  <h3 className="text-sm font-medium text-indigo-900 mb-2">Example Prompts:</h3>
                  <ul className="space-y-2">
                    {examplePrompts.map((example, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        <button
                          type="button"
                          onClick={() => applyExamplePrompt(example)}
                          className="block w-full text-left p-2 hover:bg-indigo-100 rounded transition duration-150"
                        >
                          {example}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-1">
                <textarea
                  id="prompt"
                  ref={promptRef}
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
                disabled={isSubmitting || !prompt.trim()}
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