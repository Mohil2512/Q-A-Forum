'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  FiUsers, 
  FiMessageSquare, 
  FiMessageCircle, 
  FiFlag, 
  FiUserX, 
  FiTrash2, 
  FiCheck, 
  FiX, 
  FiEye, 
  FiSettings,
  FiUserPlus,
  FiUserMinus,
  FiClock,
  FiAlertTriangle,
  FiShield,
  FiBarChart,
  FiActivity
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  reputation: number;
  isBanned: boolean;
  suspendedUntil?: string;
  suspensionReason?: string;
  questionsAsked: number;
  answersGiven: number;
  acceptedAnswers: number;
  createdAt: string;
}

interface Question {
  _id: string;
  title: string;
  content: string;
  author: {
    username: string;
  };
  tags: string[];
  views: number;
  answers: number;
  createdAt: string;
  isFlagged?: boolean;
}

interface Answer {
  _id: string;
  content: string;
  author: {
    username: string;
  };
  question: {
    _id: string;
    title: string;
  };
  createdAt: string;
  isFlagged?: boolean;
}

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'questions' | 'answers' | 'admins'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [suspensionDays, setSuspensionDays] = useState(1);
  const [suspensionReason, setSuspensionReason] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      if (!session?.user?.role || (session.user.role !== 'admin' && session.user.role !== 'master')) {
        toast.error('Access denied. Admin privileges required.');
        router.push('/');
        return;
      }
      fetchData();
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin-panel');
    }
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const [usersRes, questionsRes, answersRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/questions'),
        fetch('/api/admin/answers')
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

      if (questionsRes.ok) {
        const questionsData = await questionsRes.json();
        setQuestions(questionsData.questions || []);
      }

      if (answersRes.ok) {
        const answersData = await answersRes.json();
        setAnswers(answersData.answers || []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const banUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'PUT'
      });

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user._id === userId ? { ...user, isBanned: true } : user
        ));
        toast.success('User banned successfully');
      } else {
        toast.error('Failed to ban user');
      }
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('Failed to ban user');
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/unban`, {
        method: 'PUT'
      });

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user._id === userId ? { ...user, isBanned: false } : user
        ));
        toast.success('User unbanned successfully');
      } else {
        toast.error('Failed to unban user');
      }
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast.error('Failed to unban user');
    }
  };

  const suspendUser = async (userId: string) => {
    if (suspensionDays < 1) {
      toast.error('Suspension period must be at least 1 day');
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          days: suspensionDays,
          reason: suspensionReason || 'Violation of community guidelines'
        })
      });

      if (response.ok) {
        const suspendedUntil = new Date();
        suspendedUntil.setDate(suspendedUntil.getDate() + suspensionDays);
        
        setUsers(prev => prev.map(user => 
          user._id === userId ? { 
            ...user, 
            suspendedUntil: suspendedUntil.toISOString(),
            suspensionReason: suspensionReason || 'Violation of community guidelines'
          } : user
        ));
        setShowSuspensionModal(false);
        setSelectedUser(null);
        setSuspensionDays(1);
        setSuspensionReason('');
        toast.success(`User suspended for ${suspensionDays} day(s)`);
      } else {
        toast.error('Failed to suspend user');
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user');
    }
  };

  const unsuspendUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/unsuspend`, {
        method: 'PUT'
      });

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user._id === userId ? { 
            ...user, 
            suspendedUntil: undefined,
            suspensionReason: undefined
          } : user
        ));
        toast.success('User unsuspended successfully');
      } else {
        toast.error('Failed to unsuspend user');
      }
    } catch (error) {
      console.error('Error unsuspending user:', error);
      toast.error('Failed to unsuspend user');
    }
  };

  const deleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setQuestions(prev => prev.filter(q => q._id !== questionId));
        toast.success('Question deleted successfully');
      } else {
        toast.error('Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const deleteAnswer = async (answerId: string) => {
    if (!confirm('Are you sure you want to delete this answer?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/answers/${answerId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setAnswers(prev => prev.filter(a => a._id !== answerId));
        toast.success('Answer deleted successfully');
      } else {
        toast.error('Failed to delete answer');
      }
    } catch (error) {
      console.error('Error deleting answer:', error);
      toast.error('Failed to delete answer');
    }
  };

  const isSuspended = (user: User) => user.suspendedUntil && new Date(user.suspendedUntil) > new Date();

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container-responsive py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Admin Panel</h1>
          <p className="text-[#c8acd6] text-lg">
            Manage users, questions, and platform content
          </p>
        </div>

        {/* Tabs */}
        <div className="card mb-8">
          <div className="border-b border-[#433d8b]">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-lg ${
                  activeTab === 'users'
                    ? 'border-[#c8acd6] text-[#c8acd6]'
                    : 'border-transparent text-[#433d8b] hover:text-[#c8acd6] hover:border-[#433d8b]'
                }`}
              >
                <FiUsers className="w-4 h-4 mr-2 inline" />
                Users
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`py-4 px-1 border-b-2 font-medium text-lg ${
                  activeTab === 'questions'
                    ? 'border-[#c8acd6] text-[#c8acd6]'
                    : 'border-transparent text-[#433d8b] hover:text-[#c8acd6] hover:border-[#433d8b]'
                }`}
              >
                <FiMessageSquare className="w-4 h-4 mr-2 inline" />
                Questions
              </button>
              <button
                onClick={() => setActiveTab('answers')}
                className={`py-4 px-1 border-b-2 font-medium text-lg ${
                  activeTab === 'answers'
                    ? 'border-[#c8acd6] text-[#c8acd6]'
                    : 'border-transparent text-[#433d8b] hover:text-[#c8acd6] hover:border-[#433d8b]'
                }`}
              >
                <FiMessageCircle className="w-4 h-4 mr-2 inline" />
                Answers
              </button>
              {session?.user?.role === 'master' && (
                <button
                  onClick={() => setActiveTab('admins')}
                  className={`py-4 px-1 border-b-2 font-medium text-lg ${
                    activeTab === 'admins'
                      ? 'border-[#c8acd6] text-[#c8acd6]'
                      : 'border-transparent text-[#433d8b] hover:text-[#c8acd6] hover:border-[#433d8b]'
                  }`}
                >
                  <FiShield className="w-4 h-4 mr-2 inline" />
                  Admins
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c8acd6] mx-auto"></div>
                <p className="mt-2 text-[#c8acd6]">Loading...</p>
              </div>
            ) : activeTab === 'users' ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold gradient-text">User Management</h2>
                  <div className="text-sm text-[#c8acd6]">
                    Total Users: {users.length}
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#433d8b]">
                        <th className="text-left py-3 px-4 text-[#c8acd6] font-medium">User</th>
                        <th className="text-left py-3 px-4 text-[#c8acd6] font-medium">Role</th>
                        <th className="text-left py-3 px-4 text-[#c8acd6] font-medium">Reputation</th>
                        <th className="text-left py-3 px-4 text-[#c8acd6] font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-[#c8acd6] font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border-b border-[#433d8b]/30 hover:bg-[#433d8b]/10">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-[#c8acd6]">{user.username}</div>
                              <div className="text-sm text-[#433d8b]">{user.email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`badge ${
                              user.role === 'master' ? 'badge-danger' :
                              user.role === 'admin' ? 'badge-warning' :
                              'badge-info'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[#c8acd6]">{user.reputation}</td>
                          <td className="py-3 px-4">
                            {user.isBanned ? (
                              <span className="badge badge-danger">Banned</span>
                            ) : isSuspended(user) ? (
                              <span className="badge badge-warning">Suspended</span>
                            ) : (
                              <span className="badge badge-success">Active</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              {user.isBanned ? (
                                <button
                                  onClick={() => unbanUser(user._id)}
                                  className="btn btn-secondary text-sm"
                                >
                                  <FiUserPlus className="w-3 h-3 mr-1" />
                                  Unban
                                </button>
                              ) : (
                                <button
                                  onClick={() => banUser(user._id)}
                                  className="btn btn-danger text-sm"
                                >
                                  <FiUserX className="w-3 h-3 mr-1" />
                                  Ban
                                </button>
                              )}
                              
                              {isSuspended(user) ? (
                                <button
                                  onClick={() => unsuspendUser(user._id)}
                                  className="btn btn-secondary text-sm"
                                >
                                  <FiUserPlus className="w-3 h-3 mr-1" />
                                  Unsuspend
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowSuspensionModal(true);
                                  }}
                                  className="btn btn-warning text-sm"
                                >
                                  <FiClock className="w-3 h-3 mr-1" />
                                  Suspend
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeTab === 'questions' ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold gradient-text">Question Management</h2>
                  <div className="text-sm text-[#c8acd6]">
                    Total Questions: {questions.length}
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#433d8b]">
                        <th className="text-left py-3 px-4 text-[#c8acd6] font-medium">Question</th>
                        <th className="text-left py-3 px-4 text-[#c8acd6] font-medium">Author</th>
                        <th className="text-left py-3 px-4 text-[#c8acd6] font-medium">Views</th>
                        <th className="text-left py-3 px-4 text-[#c8acd6] font-medium">Answers</th>
                        <th className="text-left py-3 px-4 text-[#c8acd6] font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions.map((question) => (
                        <tr key={question._id} className="border-b border-[#433d8b]/30 hover:bg-[#433d8b]/10">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-[#c8acd6] line-clamp-1">{question.title}</div>
                              <div className="text-sm text-[#433d8b]">{question.tags.join(', ')}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[#c8acd6]">{question.author.username}</td>
                          <td className="py-3 px-4 text-[#c8acd6]">{question.views}</td>
                          <td className="py-3 px-4 text-[#c8acd6]">{question.answers}</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Link
                                href={`/questions/${question._id}`}
                                className="btn btn-secondary text-sm"
                              >
                                <FiEye className="w-3 h-3 mr-1" />
                                View
                              </Link>
                              <button
                                onClick={() => deleteQuestion(question._id)}
                                className="btn btn-danger text-sm"
                              >
                                <FiTrash2 className="w-3 h-3 mr-1" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeTab === 'answers' ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold gradient-text">Answer Management</h2>
                  <div className="text-sm text-[#c8acd6]">
                    Total Answers: {answers.length}
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#433d8b]">
                        <th className="text-left py-3 px-4 text-[#c8acd6] font-medium">Answer</th>
                        <th className="text-left py-3 px-4 text-[#c8acd6] font-medium">Author</th>
                        <th className="text-left py-3 px-4 text-[#c8acd6] font-medium">Question</th>
                        <th className="text-left py-3 px-4 text-[#c8acd6] font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {answers.map((answer) => (
                        <tr key={answer._id} className="border-b border-[#433d8b]/30 hover:bg-[#433d8b]/10">
                          <td className="py-3 px-4">
                            <div className="text-[#c8acd6] line-clamp-2">{answer.content}</div>
                          </td>
                          <td className="py-3 px-4 text-[#c8acd6]">{answer.author.username}</td>
                          <td className="py-3 px-4 text-[#c8acd6] line-clamp-1">{answer.question.title}</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Link
                                href={`/questions/${answer.question._id}`}
                                className="btn btn-secondary text-sm"
                              >
                                <FiEye className="w-3 h-3 mr-1" />
                                View
                              </Link>
                              <button
                                onClick={() => deleteAnswer(answer._id)}
                                className="btn btn-danger text-sm"
                              >
                                <FiTrash2 className="w-3 h-3 mr-1" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Suspension Modal */}
        {showSuspensionModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="card p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold gradient-text mb-4">
                Suspend User: {selectedUser.username}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#c8acd6] mb-2">
                    Suspension Period (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={suspensionDays}
                    onChange={(e) => setSuspensionDays(parseInt(e.target.value) || 1)}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#c8acd6] mb-2">
                    Reason
                  </label>
                  <textarea
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    placeholder="Reason for suspension..."
                    className="textarea h-20"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowSuspensionModal(false);
                    setSelectedUser(null);
                    setSuspensionDays(1);
                    setSuspensionReason('');
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => suspendUser(selectedUser._id)}
                  className="btn btn-warning"
                >
                  Suspend User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 