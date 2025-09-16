'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUser, FaCheck, FaTimes } from 'react-icons/fa';

interface FollowRequest {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
}

export default function FollowRequestsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    fetchFollowRequests();
  }, [session]);

  const fetchFollowRequests = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        const userWithRequests = await fetch(`/api/users/${data.user._id}`);
        if (userWithRequests.ok) {
          const userData = await userWithRequests.json();
          // Get details of users who sent follow requests
          if (userData.pendingFollowRequests && userData.pendingFollowRequests.length > 0) {
            const requestsData = await Promise.all(
              userData.pendingFollowRequests.map(async (requesterId: string) => {
                const requesterResponse = await fetch(`/api/users/${requesterId}`);
                if (requesterResponse.ok) {
                  const requesterData = await requesterResponse.json();
                  return {
                    _id: requesterData._id,
                    name: requesterData.name,
                    email: requesterData.email,
                    avatar: requesterData.avatar,
                    bio: requesterData.bio,
                  };
                }
                return null;
              })
            );
            setRequests(requestsData.filter(Boolean));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching follow requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requesterId: string) => {
    setActionLoading(requesterId);
    try {
      const response = await fetch('/api/follow-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requesterId }),
      });

      if (response.ok) {
        setRequests(prev => prev.filter(req => req._id !== requesterId));
      } else {
        console.error('Failed to accept follow request');
      }
    } catch (error) {
      console.error('Error accepting follow request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (requesterId: string) => {
    setActionLoading(requesterId);
    try {
      const response = await fetch(`/api/follow-requests?requesterId=${requesterId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRequests(prev => prev.filter(req => req._id !== requesterId));
      } else {
        console.error('Failed to reject follow request');
      }
    } catch (error) {
      console.error('Error rejecting follow request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Please sign in</h1>
        <Link href="/auth/signin" className="text-blue-600 hover:underline">
          Sign in to manage your follow requests
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Follow Requests</h1>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-20 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">No Follow Requests</h2>
            <p className="text-gray-600 mb-6">
              You don't have any pending follow requests at the moment.
            </p>
            <Link 
              href="/profile"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Profile
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      {request.avatar ? (
                        <img 
                          src={request.avatar} 
                          alt={request.name} 
                          className="w-12 h-12 rounded-full object-cover" 
                        />
                      ) : (
                        <FaUser className="text-gray-600 text-xl" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{request.name}</h3>
                      <p className="text-sm text-gray-600">{request.email}</p>
                      {request.bio && (
                        <p className="text-sm text-gray-500 mt-1 max-w-md truncate">
                          {request.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/users/${request._id}`}
                      className="px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={() => handleAcceptRequest(request._id)}
                      disabled={actionLoading === request._id}
                      className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      <FaCheck className="text-sm" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request._id)}
                      disabled={actionLoading === request._id}
                      className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      <FaTimes className="text-sm" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link 
            href="/profile"
            className="text-blue-600 hover:underline"
          >
            ← Back to Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
