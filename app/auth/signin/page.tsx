'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Dialog } from '@headlessui/react';

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    identifier: '', // can be email, username, or phone
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        identifier: formData.identifier,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid email or password');
      } else {
        toast.success('Signed in successfully!');
        router.push('/questions');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      toast.success('If an account with that email exists, a reset link will be sent.');
      setIsForgotOpen(false);
      setForgotEmail('');
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-[#433d8b] to-[#c8acd6] rounded-2xl flex items-center justify-center shadow-glow">
            <span className="text-[#c8acd6] font-bold text-2xl">S</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold gradient-text">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-[#c8acd6]">
          Or{' '}
          <Link href="/auth/signup" className="font-medium text-[#c8acd6] hover:text-white">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-[#c8acd6]">
                Email, Username, or Phone Number
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-[#433d8b]" />
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.identifier}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="Enter your email, username, or phone number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#c8acd6]">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-[#433d8b]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-[#433d8b]" />
                  ) : (
                    <FiEye className="h-5 w-5 text-[#433d8b]" />
                  )}
                </button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <button
                  type="button"
                  className="text-sm text-[#c8acd6] hover:underline focus:outline-none"
                  onClick={() => setIsForgotOpen(true)}
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full text-lg focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          {/* OAuth Buttons */}
          <div className="mt-6 space-y-3">
            <button
              type="button"
              className="btn btn-outline w-full flex items-center justify-center gap-2 text-lg"
              onClick={async () => {
                try {
                  await signIn('google', { callbackUrl: '/questions', redirect: true });
                } catch (error) {
                  toast.error('Error signing in with Google');
                }
              }}
            >
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g><path d="M44.5 20H24V28.5H36.9C35.5 33.1 31.2 36.5 24 36.5C16.3 36.5 10 30.2 10 22.5C10 14.8 16.3 8.5 24 8.5C27.2 8.5 30.1 9.6 32.3 11.5L38.1 6.1C34.4 2.8 29.5 0.5 24 0.5C11.8 0.5 2 10.3 2 22.5C2 34.7 11.8 44.5 24 44.5C36.2 44.5 46 34.7 46 22.5C46 21.1 45.8 20.5 45.7 20H44.5Z" fill="#FFC107"/><path d="M6.3 14.1L13.1 19.1C15.1 15.1 19.2 12.5 24 12.5C27.2 12.5 30.1 13.6 32.3 15.5L38.1 10.1C34.4 6.8 29.5 4.5 24 4.5C16.3 4.5 10 10.8 10 18.5C10 20.1 10.2 21.7 10.6 23.2L6.3 14.1Z" fill="#FF3D00"/><path d="M24 44.5C31.2 44.5 36.5 41.1 36.9 36.5H24V28.5H44.5C45.8 30.9 46 32.7 46 34.5C46 42.7 36.2 44.5 24 44.5Z" fill="#4CAF50"/><path d="M6.3 30.9L13.1 25.9C15.1 29.9 19.2 32.5 24 32.5C27.2 32.5 30.1 31.4 32.3 29.5L38.1 34.9C34.4 38.2 29.5 40.5 24 40.5C16.3 40.5 10 34.2 10 26.5C10 24.9 10.2 23.3 10.6 21.8L6.3 30.9Z" fill="#1976D2"/></g></svg>
              Sign in with Google
            </button>
            <button
              type="button"
              className="btn btn-outline w-full flex items-center justify-center gap-2 text-lg"
              onClick={async () => {
                try {
                  await signIn('github', { callbackUrl: '/questions', redirect: true });
                } catch (error) {
                  toast.error('Error signing in with GitHub');
                }
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.58 2 12.26C2 16.74 5.06 20.44 9.26 21.5C9.76 21.59 9.96 21.3 9.96 21.05C9.96 20.82 9.95 20.18 9.95 19.39C7 19.98 6.34 18.13 6.34 18.13C5.86 16.97 5.18 16.68 5.18 16.68C4.22 16.07 5.25 16.09 5.25 16.09C6.3 16.17 6.84 17.25 6.84 17.25C7.77 18.91 9.29 18.45 9.86 18.2C9.95 17.53 10.22 17.08 10.52 16.83C8.29 16.58 5.95 15.77 5.95 12.62C5.95 11.68 6.3 10.92 6.87 10.32C6.78 10.07 6.48 9.13 6.96 7.88C6.96 7.88 7.68 7.61 9.95 9.02C10.64 8.83 11.36 8.74 12.08 8.74C12.8 8.74 13.52 8.83 14.21 9.02C16.48 7.61 17.2 7.88 17.2 7.88C17.68 9.13 17.38 10.07 17.29 10.32C17.86 10.92 18.21 11.68 18.21 12.62C18.21 15.78 15.87 16.58 13.64 16.83C14.04 17.15 14.39 17.77 14.39 18.7C14.39 20.01 14.38 20.77 14.38 21.05C14.38 21.3 14.58 21.6 15.08 21.5C19.28 20.44 22.34 16.74 22.34 12.26C22.34 6.58 17.52 2 12 2Z" fill="#333"/></svg>
              Sign in with GitHub
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#433d8b]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#2e236c] text-[#c8acd6]">New to StackIt?</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Link
                href="/auth/signup"
                className="btn btn-outline text-lg"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Dialog open={isForgotOpen} onClose={() => setIsForgotOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="relative bg-[#18122b] rounded-lg max-w-md w-full mx-auto p-8 z-10">
            <Dialog.Title className="text-lg font-bold text-[#c8acd6] mb-4">Reset Password</Dialog.Title>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="input w-full"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button type="button" className="btn btn-outline" onClick={() => setIsForgotOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={forgotLoading}>
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
} 