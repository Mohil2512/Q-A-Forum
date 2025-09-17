import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      role: string;

      phoneCountry?: string;
      phoneNumber?: string;
      needsProfileCompletion?: boolean;
      displayName?: string;
      bio?: string;
      github?: string;
      linkedin?: string;
      twitter?: string;
      location?: string;
      website?: string;
      isPrivate?: boolean;
      avatar?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    username: string;
    role: string;
    phoneCountry?: string;
    phoneNumber?: string;
    needsProfileCompletion?: boolean;
    displayName?: string;
    bio?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    location?: string;
    website?: string;
    isPrivate?: boolean;
    avatar?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    role: string;
    phoneCountry?: string;
    phoneNumber?: string;
    needsProfileCompletion?: boolean;
    displayName?: string;
    bio?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    location?: string;
    website?: string;
    isPrivate?: boolean;
    avatar?: string;
  }
} 