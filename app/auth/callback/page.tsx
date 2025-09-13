'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  useEffect(() => {
    console.log('Auth callback received:', { 
      error, 
      hasCode: !!code, 
      hasState: !!state,
      allParams: Object.fromEntries(searchParams.entries())
    });

    if (error) {
      console.error('OAuth error:', error);
      
      let errorMessage = 'Authentication error occurred';
      if (error === 'OAuthSignin') {
        errorMessage = 'Error signing in with OAuth provider. Please check if the service is properly configured.';
      } else if (error === 'OAuthCallback') {
        errorMessage = 'OAuth callback error. This usually means the redirect URL is not configured correctly in your OAuth provider settings.';
      } else if (error === 'OAuthCreateAccount') {
        errorMessage = 'Could not create OAuth account. The email might already be in use.';
      } else if (error === 'EmailCreateAccount') {
        errorMessage = 'Could not create account with that email address.';
      } else if (error === 'Callback') {
        errorMessage = 'Error in callback process. Please try again.';
      } else if (error === 'Configuration') {
        errorMessage = 'OAuth configuration error. Please contact support.';
      }
      
      toast.error(errorMessage);
      
      setTimeout(() => {
        router.push('/auth/signin?error=' + error);
      }, 3000);
    } else if (code) {
      // We have a code, which means OAuth was successful
      // NextAuth should handle this automatically, just wait and redirect
      console.log('OAuth code received, waiting for NextAuth to process...');
      
      setTimeout(() => {
        // Check if we need to redirect to profile completion or questions page
        router.push('/questions');
      }, 2000);
    } else {
      // No error and no code - might be a direct access or successful auth
      console.log('No error or code, redirecting to questions...');
      router.push('/questions');
    }
  }, [error, code, state, router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-red-500 mb-4">Authentication Error</h2>
          <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded mb-4 text-left">
            <p className="font-semibold mb-2">Error: {error}</p>
            <div className="text-sm space-y-1">
              {error === 'OAuthCallback' && (
                <>
                  <p>• Check if the redirect URL in Google Console matches:</p>
                  <p className="font-mono bg-red-800 px-2 py-1 rounded">
                    http://localhost:3000/api/auth/callback/google
                  </p>
                  <p>• Verify Google Client ID and Secret are set in environment variables</p>
                </>
              )}
              {error === 'Configuration' && (
                <>
                  <p>• Google OAuth credentials may not be configured</p>
                  <p>• Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local</p>
                </>
              )}
            </div>
          </div>
          <p className="text-gray-400">Redirecting to sign in page in 3 seconds...</p>
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

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          </div>
          <h2 className="text-xl font-semibold text-[#c8acd6] mb-2">Loading...</h2>
          <p className="text-gray-400">Please wait...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
