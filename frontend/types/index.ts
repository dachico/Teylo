// types/index.ts
import { DefaultSession, User as NextAuthUser } from "next-auth";

// Create a custom User type that includes all the properties we need
export type User = NextAuthUser & {
  id: string;
  name: string;
  email: string;
  token: string;
};

declare module "next-auth" {
  interface User {
    token: string; // Only add the custom property that doesn't exist
  }

  interface Session extends DefaultSession {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken: string;
  }
}

// Game design document types
export interface GameDesignDocument {
  gameName: string;
  description: string;
  genre: string;
  setting: {
    type: string;
    description: string;
  };
  characters: Array<{
    type: string;
    description: string;
  }>;
  mechanics: string[];
  levels: Array<{
    name: string;
    description: string;
    difficulty: string;
  }>;
  assets: Record<string, string[]>;
  userInterface: string[];
}

// Project types
export interface Project {
  _id: string;
  name: string;
  description?: string;
  originalPrompt: string;
  status: 'draft' | 'processing' | 'building' | 'preview' | 'complete' | 'failed';
  gameType: 'fps' | 'adventure' | 'puzzle' | 'racing' | 'platformer' | 'other';
  buildInfo?: {
    buildId?: string;
    startTime?: string;
    endTime?: string;
    logs?: string[];
    buildUrl?: string;
    previewUrl?: string;
  };
  gameDesignDocument?: GameDesignDocument;
  createdAt: string;
  updatedAt?: string;
}

// Build job types
export interface BuildJob {
  id: string;
  projectId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedTime: number;
  error?: string;
  buildUrl?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}