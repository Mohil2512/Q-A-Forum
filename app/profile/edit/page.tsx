"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import countryCodes from '../../../lib/countryCodes';

// Add type for country code
interface CountryCode {
  name: string;
  dial_code: string;
}

export default function EditProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    displayName: "",
    email: "",
    phoneCountry: "",
    phoneNumber: "",
    bio: "",
    github: "",
    linkedin: "",
    twitter: "",
    location: "",
    website: "",
    isPrivate: false,
  });
  const [errors, setErrors] = useState<{
    phoneCountry?: string;
    phoneNumber?: string;
    bio?: string;
    username?: string;
    email?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setFormData({
        username: session.user.username || "",
        displayName: session.user.displayName || "",
        email: session.user.email || "",
        phoneCountry: session.user.phoneCountry || "+91",
        phoneNumber: session.user.phoneNumber || "",
        bio: session.user.bio || "",
        github: session.user.github || "",
        linkedin: session.user.linkedin || "",
        twitter: session.user.twitter || "",
        location: session.user.location || "",
        website: session.user.website || "",
        isPrivate: session.user.isPrivate || false,
      });
    }
  }, [session]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.username || formData.username.length < 3 || formData.username.length > 30) {
      newErrors.username = 'Username must be 3-30 characters';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    }
    if (!formData.phoneCountry) {
      newErrors.phoneCountry = 'Country code is required';
    }
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Profile updated successfully!");
        await update(); // Refresh session data
        router.push("/profile");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#c8acd6] mb-4">Please sign in to edit your profile</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold gradient-text">Edit Profile</h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Account Info */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#c8acd6]">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className={`input${errors.username ? ' border-red-500' : ''}`}
                minLength={3}
                maxLength={30}
              />
              {errors.username && <div className="text-red-500 text-xs mt-1">{errors.username}</div>}
            </div>
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-[#c8acd6]">
                Display Name (optional)
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleChange}
                className="input"
                maxLength={50}
                placeholder="Name to display (optional)"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#c8acd6]">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`input${errors.email ? ' border-red-500' : ''}`}
              />
              {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
            </div>
            {/* Contact Info */}
            <div className="flex gap-2">
              <div className="w-1/3">
                <label htmlFor="phoneCountry" className="block text-sm font-medium text-[#c8acd6]">
                  Country Code
                </label>
                <select
                  id="phoneCountry"
                  name="phoneCountry"
                  required
                  value={formData.phoneCountry || '+91'}
                  onChange={handleChange}
                  className={`input${errors.phoneCountry ? ' border-red-500' : ''}`}
                >
                  {countryCodes.map((code: CountryCode) => (
                    <option key={code.dial_code + code.name} value={code.dial_code}>
                      {code.name} ({code.dial_code})
                    </option>
                  ))}
                </select>
                {errors.phoneCountry && <div className="text-red-500 text-xs mt-1">{errors.phoneCountry}</div>}
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
                  className={`input${errors.phoneNumber ? ' border-red-500' : ''}`}
                  placeholder="10 digit phone number"
                  minLength={10}
                  maxLength={10}
                  pattern="\d{10}"
                />
                {errors.phoneNumber && <div className="text-red-500 text-xs mt-1">{errors.phoneNumber}</div>}
              </div>
            </div>
            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-[#c8acd6]">
                Bio (max 500 chars)
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className={`input${errors.bio ? ' border-red-500' : ''}`}
                maxLength={500}
                rows={3}
                placeholder="Tell us about yourself (optional)"
              />
              {errors.bio && <div className="text-red-500 text-xs mt-1">{errors.bio}</div>}
            </div>
            {/* Social Links */}
            <div>
              <label className="block text-sm font-medium text-[#c8acd6] mb-1">Social Links (optional)</label>
              <div className="flex flex-col gap-2">
                <input
                  id="github"
                  name="github"
                  type="url"
                  value={formData.github}
                  onChange={handleChange}
                  className="input"
                  placeholder="GitHub profile URL"
                />
                <input
                  id="linkedin"
                  name="linkedin"
                  type="url"
                  value={formData.linkedin}
                  onChange={handleChange}
                  className="input"
                  placeholder="LinkedIn profile URL"
                />
                <input
                  id="twitter"
                  name="twitter"
                  type="url"
                  value={formData.twitter}
                  onChange={handleChange}
                  className="input"
                  placeholder="Twitter profile URL"
                />
              </div>
            </div>
            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-[#c8acd6]">
                Location (optional)
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                className="input"
                maxLength={100}
                placeholder="City, Country"
              />
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-[#c8acd6]">
                Website (optional)
              </label>
              <input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                className="input"
                placeholder="https://yourwebsite.com"
              />
            </div>

            {/* Privacy Settings */}
            <div className="border-t border-[#433d8b]/30 pt-6">
              <h3 className="text-lg font-medium text-[#c8acd6] mb-4">Privacy Settings</h3>
              
              <div className="flex items-center">
                <input
                  id="isPrivate"
                  name="isPrivate"
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#433d8b] bg-[#17153b] border-[#433d8b] rounded focus:ring-[#c8acd6] focus:ring-2"
                />
                <label htmlFor="isPrivate" className="ml-2 block text-sm text-[#c8acd6]">
                  Private Profile
                </label>
              </div>
              <p className="mt-1 text-xs text-[#433d8b]">
                When enabled, only your followers can see your questions, answers, and profile details. Others will need to send a follow request.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full text-lg focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 