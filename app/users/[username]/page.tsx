'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaUser, 
  FaQuestion, 
  FaComment, 
  FaCalendar, 
  FaGlobe, 
  FaMapMarkerAlt, 
  FaUserPlus, 
  FaUserCheck, 
  FaClock, 
  FaEye, 
  FaLock, 
  FaEdit 
} from 'react-icons/fa';
import toast from 'react-hot-toast';

interface UserProfile {
  _id: string;
  username: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  joinDate: string;
  isPrivate: boolean;
  stats: {
    questionsAsked: number;
    answersGiven: number;
    acceptedAnswers: number;
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
  slug: string;
  content: string;
  tags: Array<{
    _id: string;
    name: string;
  }>;
  votes: number | {
    upvotes: string[];
    downvotes: string[];
  };
  views: number;
  answers: number;
  createdAt: string;
}

interface Answer {
  _id: string;
  content: string;
  isAccepted: boolean;
  votes: number | {
    upvotes: string[];
    downvotes: string[];
  };
  question: {
    _id: string;
    title: string;
    slug: string;
  };
  createdAt: string;
}

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'questions' | 'answers'>('questions');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const getVoteCount = (votes: number | { upvotes: string[]; downvotes: string[] }): number => {
    if (typeof votes === 'number') {
      return votes;
    }
    return (votes?.upvotes?.length || 0) - (votes?.downvotes?.length || 0);
  };

  useEffect(() => {
    if (params.username) {
      fetchUserProfile();
    }
  }, [params.username, session]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/profile/${params.username}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsFollowing(userData.followStatus === 'following');
        
        if (userData.canViewProfile) {
          await fetchUserContent();
        }
      } else if (response.status === 404) {
        toast.error('User not found');
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserContent = async () => {
    try {
      console.log('Fetching content for user:', params.username);
      // Fetch user's questions
      const questionsResponse = await fetch(`/api/users/profile/${params.username}/questions`);
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        console.log('Questions response:', questionsData);
        setQuestions(questionsData.questions || []);
      } else {
        console.error('Questions API error:', questionsResponse.status, await questionsResponse.text());
      }

      // Fetch user's answers
      const answersResponse = await fetch(`/api/users/profile/${params.username}/answers`);
      if (answersResponse.ok) {
        const answersData = await answersResponse.json();
        console.log('Answers response:', answersData);
        setAnswers(answersData.answers || []);
      } else {
        console.error('Answers API error:', answersResponse.status, await answersResponse.text());
      }
    } catch (error) {
      console.error('Error fetching user content:', error);
    }
  };

  const handleFollow = async () => {
    if (!session) {
      toast.error('Please sign in to follow users');
      return;
    }

    setFollowLoading(true);
    try {
      // First, get the current follow status from the server to ensure consistency
      const profileResponse = await fetch(`/api/users/profile/${params.username}`);
      if (!profileResponse.ok) {
        throw new Error('Failed to get current follow status');
      }
      
      const profileData = await profileResponse.json();
      const currentlyFollowing = profileData.followStatus === 'following';
      
      // Update local state to match server state
      setIsFollowing(currentlyFollowing);
      setUser(prev => prev ? { ...prev, followStatus: profileData.followStatus } : null);
      
      // Now make the follow/unfollow request based on server state
      const response = await fetch(`/api/follow${currentlyFollowing ? `?userId=${user?._id}` : ''}`, {
        method: currentlyFollowing ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        ...(currentlyFollowing ? {} : {
          body: JSON.stringify({
            userId: user?._id,
          }),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(!currentlyFollowing);
        setUser(prev => prev ? {
          ...prev,
          stats: {
            ...prev.stats,
            followers: prev.stats.followers + (currentlyFollowing ? -1 : 1)
          },
          followStatus: currentlyFollowing ? 'not_following' : 'following'
        } : null);
        
        toast.success(data.message);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update follow status');
      }
    } catch (error) {
      console.error('Follow error:', error);
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const getUserAvatar = () => {
    if (user?.avatar) {
      return (
        <img 
          src={user.avatar} 
          alt={user.displayName || user.username}
          className="w-32 h-32 rounded-full object-cover border-4 border-purple-500/20"
        />
      );
    }
    return (
      <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center border-4 border-purple-500/20">
        <FaUser className="w-12 h-12 text-white" />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#c8acd6] mb-4">User not found</h1>
          <Link href="/" className="btn btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (!user.canViewProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <FaLock className="w-16 h-16 text-[#c8acd6] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#c8acd6] mb-4">Private Profile</h1>
          <p className="text-gray-400 mb-6">
            This user's profile is private. {user.followStatus === 'pending' ? 'Your follow request is pending.' : 'Send a follow request to view their content.'}
          </p>
          {user.followStatus === 'not_following' && session && !user.isOwner && (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className="btn btn-primary"
            >
              {followLoading ? 'Sending...' : 'Send Follow Request'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="container-responsive max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="card mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {getUserAvatar()}
              </div>
              
              {/* User Info */}
              <div className="flex-grow text-center md:text-left">
                <h1 className="text-3xl font-bold text-[#c8acd6] mb-2">
                  {user.displayName || user.username}
                </h1>
                <p className="text-gray-400 mb-4">@{user.username}</p>
                
                {user.bio && (
                  <p className="text-gray-300 mb-4">{user.bio}</p>
                )}
                
                {/* User Details */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <FaCalendar className="w-4 h-4" />
                    Joined {new Date(user.joinDate).toLocaleDateString()}
                  </div>
                  {user.location && (
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="w-4 h-4" />
                      {user.location}
                    </div>
                  )}
                  {user.website && (
                    <div className="flex items-center gap-2">
                      <FaGlobe className="w-4 h-4" />
                      <a 
                        href={user.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#58a6ff] hover:text-[#7dd3fc] transition-colors"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </div>
                
                {/* Stats */}
                <div className="flex flex-wrap gap-6 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#c8acd6]">{user.stats.questionsAsked}</div>
                    <div className="text-sm text-gray-400">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#c8acd6]">{user.stats.answersGiven}</div>
                    <div className="text-sm text-gray-400">Answers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#c8acd6]">{user.stats.acceptedAnswers}</div>
                    <div className="text-sm text-gray-400">Accepted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#c8acd6]">{user.stats.followers}</div>
                    <div className="text-sm text-gray-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#c8acd6]">{user.stats.following}</div>
                    <div className="text-sm text-gray-400">Following</div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-4 justify-center md:justify-start">
                  {user.isOwner ? (
                    <Link 
                      href="/profile/edit" 
                      className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl border-2 border-purple-500/50 hover:border-purple-400"
                    >
                      <FaEdit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Link>
                  ) : session && (
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
                        isFollowing 
                          ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {followLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                      ) : isFollowing ? (
                        <FaUserCheck className="w-4 h-4 mr-2" />
                      ) : (
                        <FaUserPlus className="w-4 h-4 mr-2" />
                      )}
                      {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Tabs */}
        <div className="mb-6">
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'questions'
                  ? 'text-[#58a6ff] border-b-2 border-[#58a6ff]'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <FaQuestion className="w-4 h-4 inline mr-2" />
              Questions ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('answers')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'answers'
                  ? 'text-[#58a6ff] border-b-2 border-[#58a6ff]'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <FaComment className="w-4 h-4 inline mr-2" />
              Answers ({answers.length})
            </button>
          </div>
        </div>
        
        {/* Content */}
        {activeTab === 'questions' ? (
          <div className="space-y-4">
            {questions.length > 0 ? (
              questions.map((question) => (
                <div key={question._id} className="card p-6">
                  <Link href={`/questions/${question.slug}`} className="block">
                    <h3 className="text-xl font-semibold text-[#c8acd6] mb-2 hover:text-[#58a6ff] transition-colors">
                      {question.title}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {question.tags.map((tag) => (
                      <span
                        key={tag._id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex gap-4">
                      <span>{getVoteCount(question.votes)} votes</span>
                      <span>{question.answers} answers</span>
                      <span>{question.views} views</span>
                    </div>
                    <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FaQuestion className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No questions yet</h3>
                <p className="text-gray-500">
                  {user.isOwner ? "You haven't asked any questions yet." : `${user.displayName || user.username} hasn't asked any questions yet.`}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {answers.length > 0 ? (
              answers.map((answer) => (
                <div key={answer._id} className="card p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Link 
                      href={`/questions/${answer.question.slug}`}
                      className="text-lg font-semibold text-[#c8acd6] hover:text-[#58a6ff] transition-colors"
                    >
                      {answer.question.title}
                    </Link>
                    {answer.isAccepted && (
                      <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-full text-xs font-medium">
                        Accepted
                      </span>
                    )}
                  </div>
                  <div className="text-gray-300 mb-4" dangerouslySetInnerHTML={{ __html: answer.content.substring(0, 200) + '...' }} />
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{getVoteCount(answer.votes)} votes</span>
                    <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FaComment className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No answers yet</h3>
                <p className="text-gray-500">
                  {user.isOwner ? "You haven't answered any questions yet." : `${user.displayName || user.username} hasn't answered any questions yet.`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
