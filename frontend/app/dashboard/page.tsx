'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import { Project } from '@/types';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken) {
      fetchProjects();
    }
  }, [session]);

  const fetchProjects = async () => {
    try {
      const data = await apiRequest<{ data: Project[] }>('/projects');
      setProjects(data.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Set to empty array to indicate loading completed
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
                <Link
                  href="/projects/new"
                  className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Create New Game
                </Link>
              </div>

              {isLoading ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-indigo-300 mb-4"></div>
                    <div className="h-4 w-48 bg-indigo-300 rounded mb-3"></div>
                    <div className="h-3 w-32 bg-indigo-200 rounded"></div>
                  </div>
                  <p className="mt-4 text-gray-500">Loading your projects...</p>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-500 mb-6">Create your first game to get started</p>
                  <Link
                    href="/projects/new"
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Create Game
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                    <div key={project._id} className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-gray-900 truncate">{project.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {project.description || 'No description'}
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          Status: <span className="font-medium capitalize">{project.status}</span>
                        </p>
                      </div>
                      <div className="bg-gray-50 px-4 py-4 sm:px-6">
                        <Link
                          href={`/projects/${project._id}`}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          View Project
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}