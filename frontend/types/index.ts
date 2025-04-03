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

// Project types
export interface Project {
  _id: string;
  name: string;
  description?: string;
  originalPrompt: string;
  status: string;
  gameType: string;
  buildInfo?: {
    buildUrl?: string;
    previewUrl?: string;
  };
  gameDesignDocument?: Record<string, unknown>;
  createdAt: string;
}