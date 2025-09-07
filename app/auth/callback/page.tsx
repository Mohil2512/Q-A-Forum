'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      console.error('OAuth error:', error);
      
      if (error === 'OAuthSignin') {
        toast.error('Error signing in with OAuth provider');
      } else if (error === 'OAuthCallback') {
        toast.error('Error in OAuth callback');
      } else if (error === 'OAuthCreateAccount') {
        toast.error('Could not create OAuth account');
      } else if (error === 'EmailCreateAccount') {
        toast.error('Could not create account with that email');
      } else if (error === 'Callback') {
        toast.error('Error in callback process');
      } else {
        toast.error('Authentication error occurred');
      }
      
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
    } else {
      // If no error, redirect to questions page
      router.push('/questions');
    }
  }, [error, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          </div>
          <h2 className="text-xl font-semibold text-red-500 mb-2">Authentication Error</h2>
          <p className="text-gray-400">Redirecting to sign in page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        </div>
        <h2 className="text-xl font-semibold text-[#c8acd6] mb-2">Signing you in...</h2>
        <p className="text-gray-400">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
}
