"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import countryCodes from "../../../lib/countryCodes";
import toast from "react-hot-toast";

interface CountryCode {
  name: string;
  dial_code: string;
}

export default function CompleteProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    phoneCountry: "+91",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setFormData({
        username: session.user.username || "",
        phoneCountry: session.user.phoneCountry || "+91",
        phoneNumber: session.user.phoneNumber || "",
      });
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!formData.username.trim()) {
      toast.error("Username is required");
      setLoading(false);
      return;
    }
    if (!formData.phoneCountry) {
      toast.error("Country code is required");
      setLoading(false);
      return;
    }
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      toast.error("Phone number must be 10 digits");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: session?.user?.email,
          phoneCountry: formData.phoneCountry,
          phoneNumber: formData.phoneNumber,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Profile completed!");
        setProfileCompleted(true);
        
        // Update session with new data - this will trigger the JWT callback
        await updateSession({
          user: {
            ...session?.user,
            username: formData.username,
            phoneCountry: formData.phoneCountry,
            phoneNumber: formData.phoneNumber,
            needsProfileCompletion: false,
          }
        });
        
        // Small delay to ensure session update is processed
        setTimeout(() => {
          router.push("/questions");
        }, 1000);
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-black">
      <div className="card p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4 text-[#c8acd6]">Complete Your Profile</h2>
        <p className="text-gray-400 text-center mb-6">To finish signing up, please provide a username and phone number.</p>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-[#c8acd6]">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className="input"
              minLength={3}
              maxLength={30}
              placeholder="Enter your username"
            />
          </div>
          <div className="flex gap-2">
            <div className="w-1/3">
              <label htmlFor="phoneCountry" className="block text-sm font-medium text-[#c8acd6]">Country Code</label>
              <select
                id="phoneCountry"
                name="phoneCountry"
                required
                value={formData.phoneCountry}
                onChange={handleChange}
                className="input"
              >
                {countryCodes.map((code: CountryCode) => (
                  <option key={code.dial_code + code.name} value={code.dial_code}>
                    {code.name} ({code.dial_code})
                  </option>
                ))}
              </select>
            </div>
            <div className="w-2/3">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-[#c8acd6]">Phone Number</label>
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
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full text-lg focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Complete Profile"}
          </button>
          
          {profileCompleted && (
            <button
              type="button"
              onClick={() => router.push("/questions")}
              className="btn btn-secondary w-full text-lg mt-2"
            >
              Continue to Questions →
            </button>
          )}
        </form>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          className="btn btn-outline w-full mt-4"
        >
          Cancel and Sign Out
        </button>
      </div>
    </div>
  );
} 