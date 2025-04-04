// app/projects/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiRequest, BuildStatus } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import UnityPreview from '@/components/unity/UnityPreview';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useNotification } from '@/contexts/NotificationContext';
import { Project } from '@/types';

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buildInProgress, setBuildInProgress] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const { addNotification } = useNotification();

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  useEffect(() => {
    // Set up polling for build status updates
    if (project && ['processing', 'building'].includes(project.status)) {
      const intervalId = setInterval(fetchProject, 5000); // Poll every 5 seconds
      return () => clearInterval(intervalId);
    }
  }, [project]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<Project>(`/projects/${id}`);
      
      if (response.success) {
        setProject(response.data);
        
        // If the project is in processing or building status,
        // fetch the build status for progress updates
        if (['processing', 'building'].includes(response.data.status) && 
            response.data.buildInfo?.buildId) {
          fetchBuildStatus(response.data.buildInfo.buildId);
        }
      } else {
        setError('Failed to load project data');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const fetchBuildStatus = async (buildId: string) => {
    try {
      const response = await apiRequest<BuildStatus>(`/projects/build/${buildId}`);
      
      if (response.success) {
        setBuildProgress(response.data.progress || 0);
      }
    } catch (error) {
      console.error('Error fetching build status:', error);
      // Don't set error state, just log the error
    }
  };

  const startBuild = async () => {
    try {
      setBuildInProgress(true);
      addNotification('info', 'Starting build process...', 0);
      
      await apiRequest(`/projects/${id}/build`, 'POST');
      
      // Show success notification
      addNotification('success', 'Build started successfully!');
      
      // Reset progress to 0 before starting
      setBuildProgress(0);
      fetchProject(); // Refresh project data
    } catch (error) {
      console.error('Error starting build:', error);
      setError('Failed to start build process');
      addNotification('error', 'Failed to start the build process. Please try again.');
      setBuildInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
          <LoadingSpinner size="large" text="Loading project..." />
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
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(project.createdAt).toLocaleDateString()}
                </dd>
              </div>
              {project.updatedAt && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
              )}
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
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${buildProgress}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-xs text-gray-500 text-right">{buildProgress}%</p>
              </div>
            </div>
          </div>
        )}

        {(project.status === 'preview' || project.status === 'complete') && project.buildInfo?.previewUrl && (
          <div className="bg-white shadow sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Game Preview</h3>
              <div className="mt-2 aspect-[16/9] w-full border border-gray-300 rounded-lg overflow-hidden">
                <UnityPreview buildUrl={project.buildInfo.previewUrl} />
              </div>
            </div>
          </div>
        )}

        {project.status === 'failed' && (
          <div className="bg-white shadow sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-red-800">Build Failed</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>There was an error generating your game.</p>
                {project.buildInfo?.logs && project.buildInfo.logs.length > 0 && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-md overflow-auto max-h-48">
                    <pre className="text-xs text-red-600">
                      {project.buildInfo.logs.join('\n')}
                    </pre>
                  </div>
                )}
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={startBuild}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Try Again
                </button>
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
              <div className="text-sm text-gray-900">
                {/* Game Name */}
                <div className="mb-6">
                  <h4 className="font-medium text-lg">{project.gameDesignDocument.gameName}</h4>
                  <p className="text-gray-600 mt-1">{project.gameDesignDocument.description}</p>
                </div>
                
                {/* Genre & Setting */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h5 className="font-medium">Genre</h5>
                    <p>{project.gameDesignDocument.genre}</p>
                  </div>
                  <div>
                    <h5 className="font-medium">Setting</h5>
                    <p>{project.gameDesignDocument.setting.description}</p>
                  </div>
                </div>
                
                {/* Characters */}
                <div className="mb-6">
                  <h5 className="font-medium mb-2">Characters</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {project.gameDesignDocument.characters.map((character, index) => (
                      <li key={index}>
                        <span className="font-medium">{character.type}:</span> {character.description}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Mechanics */}
                <div className="mb-6">
                  <h5 className="font-medium mb-2">Game Mechanics</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {project.gameDesignDocument.mechanics.map((mechanic, index) => (
                      <li key={index}>{mechanic}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Levels */}
                <div className="mb-6">
                  <h5 className="font-medium mb-2">Levels</h5>
                  <div className="space-y-3">
                    {project.gameDesignDocument.levels.map((level, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <h6 className="font-medium">{level.name} <span className="text-xs text-gray-500 ml-2">({level.difficulty})</span></h6>
                        <p className="text-sm">{level.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* User Interface */}
                <div className="mb-6">
                  <h5 className="font-medium mb-2">User Interface</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {project.gameDesignDocument.userInterface.map((ui, index) => (
                      <li key={index}>{ui}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Assets */}
                <div>
                  <h5 className="font-medium mb-2">Assets</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(project.gameDesignDocument.assets).map(([category, assets]) => (
                      <div key={category} className="border border-gray-200 rounded p-3">
                        <h6 className="font-medium capitalize">{category}</h6>
                        <ul className="list-disc pl-5 text-sm mt-1">
                          {assets.map((asset, index) => (
                            <li key={index}>{asset}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}