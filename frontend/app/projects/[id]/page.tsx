// app/projects/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import { Project } from '@/types';

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buildInProgress, setBuildInProgress] = useState(false);

  useEffect(() => {
    // todo - for tomorrow morning
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<{ data: Project }>(`/projects/${id}`);
      setProject(response.data);
      
      // If project is in processing or building status, poll for updates
      if (['processing', 'building'].includes(response.data.status)) {
        const intervalId = setInterval(fetchProject, 5000); // Poll every 5 seconds
        return () => clearInterval(intervalId);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const startBuild = async () => {
    try {
      setBuildInProgress(true);
      await apiRequest(`/projects/${id}/build`, 'POST');
      fetchProject(); // Refresh project data
    } catch (error) {
      console.error('Error starting build:', error);
      setError('Failed to start build process');
      setBuildInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-medium text-red-800">{error}</h3>
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-4 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <p className="text-center">Project not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Project Details</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Game information and status</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{project.status}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Game Type</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{project.gameType}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Original Prompt</dt>
                <dd className="mt-1 text-sm text-gray-900">{project.originalPrompt}</dd>
              </div>
            </dl>
          </div>
        </div>

        {project.status === 'draft' && (
          <div className="bg-white shadow sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Start Build</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Start the build process to generate your game</p>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={startBuild}
                  disabled={buildInProgress}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-75"
                >
                  {buildInProgress ? 'Building...' : 'Start Build'}
                </button>
              </div>
            </div>
          </div>
        )}

        {(['processing', 'building'].includes(project.status)) && (
          <div className="bg-white shadow sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Build in Progress</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Your game is being generated. This may take a few minutes.</p>
              </div>
              <div className="mt-5">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-indigo-600 h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {project.status === 'preview' && project.buildInfo?.previewUrl && (
          <div className="bg-white shadow sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Game Preview</h3>
              <div className="mt-2 aspect-[16/9] w-full border border-gray-300 rounded-lg overflow-hidden">
                {/* This is where we'll integrate the WebGL preview */}
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <p className="text-gray-500">WebGL preview will be integrated here</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {project.gameDesignDocument && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Game Design Document</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                {JSON.stringify(project.gameDesignDocument, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}