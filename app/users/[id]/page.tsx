'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUser, FaQuestion, FaComment, FaTrophy, FaCalendar, FaGlobe, FaMapMarkerAlt, FaUserPlus, FaUserCheck, FaClock, FaEye, FaLock, FaEdit } from 'react-icons/fa';

interface UserProfile {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinDate: string;
  isPrivate: boolean;
  reputation: number;
  stats: {
    questions: number;
    answers: number;
    followers: number;
    following: number;
  };
  followStatus: 'none' | 'following' | 'pending' | 'not_following';
  isOwner: boolean;
  canViewProfile: boolean;
  followers?: any[];
  following?: any[];
}

interface Question {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  views: number;
  answers: number;
  createdAt: string;
}

interface Answer {
  _id: string;
  content: string;
  question: {
    _id: string;
    title: string;
  };
  upvotes: number;
  downvotes: number;
  isAccepted: boolean;
  createdAt: string;
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'answers' | 'followers' | 'following'>('overview');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [params.id]);

  useEffect(() => {
    if (profile && activeTab === 'questions' && questions.length === 0) {
      fetchUserQuestions();
    } else if (profile && activeTab === 'answers' && answers.length === 0) {
      fetchUserAnswers();
    }
  }, [activeTab, profile]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        console.error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserQuestions = async () => {
    if (!profile?.canViewProfile) return;
    
    try {
      const response = await fetch(`/api/questions?author=${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error('Error fetching user questions:', error);
    }
  };

  const fetchUserAnswers = async () => {
    if (!profile?.canViewProfile) return;
    
    try {
      const response = await fetch(`/api/answers?author=${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setAnswers(data.answers || []);
      }
    } catch (error) {
      console.error('Error fetching user answers:', error);
    }
  };

  const handleFollow = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setFollowLoading(true);
    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: params.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? {
          ...prev,
          followStatus: data.status === 'pending' ? 'pending' : 'following',
          stats: {
            ...prev.stats,
            followers: data.status === 'following' ? prev.stats.followers + 1 : prev.stats.followers
          }
        } : null);
      }
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    setFollowLoading(true);
    try {
      const response = await fetch(`/api/follow?userId=${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProfile(prev => prev ? {
          ...prev,
          followStatus: 'not_following',
          stats: {
            ...prev.stats,
            followers: Math.max(0, prev.stats.followers - 1)
          }
        } : null);
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const renderFollowButton = () => {
    if (!session || profile?.isOwner) return null;

    switch (profile?.followStatus) {
      case 'following':
        return (
          <button
            onClick={handleUnfollow}
            disabled={followLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            <FaUserCheck />
            <span>Following</span>
          </button>
        );
      case 'pending':
        return (
          <button
            onClick={handleUnfollow}
            disabled={followLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
          >
            <FaClock />
            <span>Pending</span>
          </button>
        );
      case 'not_following':
      default:
        return (
          <button
            onClick={handleFollow}
            disabled={followLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <FaUserPlus />
            <span>Follow</span>
          </button>
        );
    }
  };

  const renderStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <div className="text-2xl font-bold text-blue-600">{profile?.reputation || 0}</div>
        <div className="text-sm text-gray-600">Reputation</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <div className="text-2xl font-bold text-green-600">{profile?.stats.questions || 0}</div>
        <div className="text-sm text-gray-600">Questions</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <div className="text-2xl font-bold text-orange-600">{profile?.stats.answers || 0}</div>
        <div className="text-sm text-gray-600">Answers</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <div className="text-2xl font-bold text-purple-600">{profile?.stats.followers || 0}</div>
        <div className="text-sm text-gray-600">Followers</div>
      </div>
    </div>
  );

  const renderPrivateMessage = () => (
    <div className="bg-gray-100 p-8 rounded-lg text-center">
      <FaLock className="text-gray-400 text-4xl mb-4 mx-auto" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">Private Profile</h3>
      <p className="text-gray-600">
        This user has a private profile. You need to follow them to see their content.
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-32 rounded-lg mb-6"></div>
          <div className="bg-gray-200 h-8 w-1/3 rounded mb-4"></div>
          <div className="bg-gray-200 h-4 w-2/3 rounded"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">User Not Found</h1>
        <Link href="/" className="text-blue-600 hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <FaUser className="text-gray-600 text-2xl" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{profile.name}</h1>
                {profile.bio && <p className="text-gray-600 mt-1">{profile.bio}</p>}
                
                <div className="flex flex-wrap items-center space-x-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <FaCalendar />
                    <span>Joined {new Date(profile.joinDate).toLocaleDateString()}</span>
                  </div>
                  {profile.location && (
                    <div className="flex items-center space-x-1">
                      <FaMapMarkerAlt />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center space-x-1">
                      <FaGlobe />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-4 md:mt-0">
                {profile.isOwner && (
                  <Link 
                    href="/profile/edit"
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <FaEdit />
                    <span>Edit Profile</span>
                  </Link>
                )}
                {renderFollowButton()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {renderStats()}

      {profile.canViewProfile ? (
        <>
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                {(['overview', 'questions', 'answers', 'followers', 'following'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm capitalize ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab}
                    {tab === 'followers' && ` (${profile.stats.followers})`}
                    {tab === 'following' && ` (${profile.stats.following})`}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    {profile.bio || 'No bio available.'}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Recent Questions</h3>
                      {/* We could add recent questions here */}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Recent Answers</h3>
                      {/* We could add recent answers here */}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'questions' && (
                <div className="space-y-4">
                  {questions.length > 0 ? (
                    questions.map((question) => (
                      <div key={question._id} className="border-b pb-4 last:border-b-0">
                        <Link href={`/questions/${question._id}`} className="block hover:bg-gray-50 p-2 rounded">
                          <h3 className="font-semibold text-blue-600 hover:underline">
                            {question.title}
                          </h3>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>{question.upvotes - question.downvotes} votes</span>
                            <span>{question.answers} answers</span>
                            <span>{question.views} views</span>
                            <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                          </div>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No questions yet.</p>
                  )}
                </div>
              )}

              {activeTab === 'answers' && (
                <div className="space-y-4">
                  {answers.length > 0 ? (
                    answers.map((answer) => (
                      <div key={answer._id} className="border-b pb-4 last:border-b-0">
                        <Link href={`/questions/${answer.question._id}`} className="block hover:bg-gray-50 p-2 rounded">
                          <h3 className="font-semibold text-blue-600 hover:underline">
                            {answer.question.title}
                          </h3>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <span className={`${answer.isAccepted ? 'text-green-600' : 'text-gray-500'}`}>
                              {answer.upvotes - answer.downvotes} votes
                            </span>
                            {answer.isAccepted && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                Accepted
                              </span>
                            )}
                            <span className="text-gray-500">{new Date(answer.createdAt).toLocaleDateString()}</span>
                          </div>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No answers yet.</p>
                  )}
                </div>
              )}

              {activeTab === 'followers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.followers && profile.followers.length > 0 ? (
                    profile.followers.map((follower: any) => (
                      <Link key={follower._id} href={`/users/${follower._id}`} className="block p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            {follower.avatar ? (
                              <img src={follower.avatar} alt={follower.name} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <FaUser className="text-gray-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{follower.name}</div>
                            <div className="text-sm text-gray-500">{follower.email}</div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8 col-span-full">No followers yet.</p>
                  )}
                </div>
              )}

              {activeTab === 'following' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.following && profile.following.length > 0 ? (
                    profile.following.map((following: any) => (
                      <Link key={following._id} href={`/users/${following._id}`} className="block p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            {following.avatar ? (
                              <img src={following.avatar} alt={following.name} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <FaUser className="text-gray-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{following.name}</div>
                            <div className="text-sm text-gray-500">{following.email}</div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8 col-span-full">Not following anyone yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        renderPrivateMessage()
      )}
    </div>
  );
}
