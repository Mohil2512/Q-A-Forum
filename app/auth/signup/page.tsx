'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import countryCodes from '../../../lib/countryCodes';

// Add type for country code
interface CountryCode {
  name: string;
  dial_code: string;
}

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneCountry: '+91', // Initialize with India's code
    phoneNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      toast.error('Phone number must be 10 digits');
      setLoading(false);
      return;
    }
    if (!formData.phoneCountry) {
      toast.error('Country code is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phoneCountry: formData.phoneCountry,
          phoneNumber: formData.phoneNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Account created successfully! Please sign in.');
        router.push('/auth/signin');
      } else {
        toast.error(data.error || 'Failed to create account');
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

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-[#433d8b] to-[#c8acd6] rounded-2xl flex items-center justify-center shadow-glow">
            <span className="text-[#c8acd6] font-bold text-2xl">S</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold gradient-text">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-[#c8acd6]">
          Or{' '}
          <Link href="/auth/signin" className="font-medium text-[#c8acd6] hover:text-white">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#c8acd6]">
                Username
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-[#433d8b]" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="Enter your username"
                  minLength={3}
                  maxLength={30}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#c8acd6]">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-[#433d8b]" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="Enter your email"
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input pl-10 pr-10"
                  placeholder="Enter your password"
                  minLength={8}
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
              <div className="mt-2 text-xs text-[#c8acd6]">
                Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#c8acd6]">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-[#433d8b]" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input pl-10 pr-10"
                  placeholder="Confirm your password"
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5 text-[#433d8b]" />
                  ) : (
                    <FiEye className="h-5 w-5 text-[#433d8b]" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="w-1/3">
                <label htmlFor="phoneCountry" className="block text-sm font-medium text-[#c8acd6]">
                  Country Code
                </label>
                <select
                  id="phoneCountry"
                  name="phoneCountry"
                  required
                  value={formData.phoneCountry}
                  onChange={e => setFormData({ ...formData, phoneCountry: e.target.value })}
                  className="input"
                >
                  {countryCodes.map((code: CountryCode) => (
                    <option key={code.dial_code} value={code.dial_code}>
                      {code.name} ({code.dial_code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-2/3">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-[#c8acd6]">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="text"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="input"
                  placeholder="10 digit phone number"
                  minLength={10}
                  maxLength={10}
                  pattern="\d{10}"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full text-lg focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>

          {/* OAuth Buttons */}
          <div className="mt-6 space-y-3">
            <button
              type="button"
              className="btn btn-outline w-full flex items-center justify-center gap-2 text-lg"
              onClick={() => signIn('google', { callbackUrl: '/questions' })}
            >
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g><path d="M44.5 20H24V28.5H36.9C35.5 33.1 31.2 36.5 24 36.5C16.3 36.5 10 30.2 10 22.5C10 14.8 16.3 8.5 24 8.5C27.2 8.5 30.1 9.6 32.3 11.5L38.1 6.1C34.4 2.8 29.5 0.5 24 0.5C11.8 0.5 2 10.3 2 22.5C2 34.7 11.8 44.5 24 44.5C36.2 44.5 46 34.7 46 22.5C46 21.1 45.8 20.5 45.7 20H44.5Z" fill="#FFC107"/><path d="M6.3 14.1L13.1 19.1C15.1 15.1 19.2 12.5 24 12.5C27.2 12.5 30.1 13.6 32.3 15.5L38.1 10.1C34.4 6.8 29.5 4.5 24 4.5C16.3 4.5 10 10.8 10 18.5C10 20.1 10.2 21.7 10.6 23.2L6.3 14.1Z" fill="#FF3D00"/><path d="M24 44.5C31.2 44.5 36.5 41.1 36.9 36.5H24V28.5H44.5C45.8 30.9 46 32.7 46 34.5C46 42.7 36.2 44.5 24 44.5Z" fill="#4CAF50"/><path d="M6.3 30.9L13.1 25.9C15.1 29.9 19.2 32.5 24 32.5C27.2 32.5 30.1 31.4 32.3 29.5L38.1 34.9C34.4 38.2 29.5 40.5 24 40.5C16.3 40.5 10 34.2 10 26.5C10 24.9 10.2 23.3 10.6 21.8L6.3 30.9Z" fill="#1976D2"/></g></svg>
              Sign up with Google
            </button>
            <button
              type="button"
              className="btn btn-outline w-full flex items-center justify-center gap-2 text-lg"
              onClick={() => signIn('github', { callbackUrl: '/questions' })}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.58 2 12.26C2 16.74 5.06 20.44 9.26 21.5C9.76 21.59 9.96 21.3 9.96 21.05C9.96 20.82 9.95 20.18 9.95 19.39C7 19.98 6.34 18.13 6.34 18.13C5.86 16.97 5.18 16.68 5.18 16.68C4.22 16.07 5.25 16.09 5.25 16.09C6.3 16.17 6.84 17.25 6.84 17.25C7.77 18.91 9.29 18.45 9.86 18.2C9.95 17.53 10.22 17.08 10.52 16.83C8.29 16.58 5.95 15.77 5.95 12.62C5.95 11.68 6.3 10.92 6.87 10.32C6.78 10.07 6.48 9.13 6.96 7.88C6.96 7.88 7.68 7.61 9.95 9.02C10.64 8.83 11.36 8.74 12.08 8.74C12.8 8.74 13.52 8.83 14.21 9.02C16.48 7.61 17.2 7.88 17.2 7.88C17.68 9.13 17.38 10.07 17.29 10.32C17.86 10.92 18.21 11.68 18.21 12.62C18.21 15.78 15.87 16.58 13.64 16.83C14.04 17.15 14.39 17.77 14.39 18.7C14.39 20.01 14.38 20.77 14.38 21.05C14.38 21.3 14.58 21.6 15.08 21.5C19.28 20.44 22.34 16.74 22.34 12.26C22.34 6.58 17.52 2 12 2Z" fill="#333"/></svg>
              Sign up with GitHub
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#433d8b]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#2e236c] text-[#c8acd6]">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Link
                href="/auth/signin"
                className="btn btn-outline text-lg"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
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
      <SignUpContent />
    </Suspense>
  );
} 