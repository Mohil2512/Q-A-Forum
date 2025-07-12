'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaUser, FaQuestion, FaComment, FaTrophy, FaCalendar, FaEdit } from 'react-icons/fa';

interface Question {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  votes: {
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
  question: {
    _id: string;
    title: string;
  };
  votes: {
    upvotes: string[];
    downvotes: string[];
  };
  isAccepted: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'questions' | 'answers'>('questions');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      const [questionsRes, answersRes] = await Promise.all([
        fetch(`/api/questions?author=${session?.user?.id}`),
        fetch(`/api/answers?author=${session?.user?.id}`)
      ]);

      const questionsData = await questionsRes.json();
      const answersData = await answersRes.json();

      setQuestions(questionsData.questions || []);
      setAnswers(answersData.answers || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateReputation = () => {
    const questionVotes = questions.reduce((total, q) => 
      total + (q.votes.upvotes.length - q.votes.downvotes.length), 0
    );
    const answerVotes = answers.reduce((total, a) => 
      total + (a.votes.upvotes.length - a.votes.downvotes.length), 0
    );
    const acceptedBonus = answers.filter(a => a.isAccepted).length * 15;
    
    return (session?.user?.reputation || 0) + questionVotes + answerVotes + acceptedBonus;
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#c8acd6] mb-4">Please sign in to view your profile</h1>
          <Link href="/auth/signin" className="btn btn-primary px-6 py-2 text-lg">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="card p-6 mb-6 flex items-center space-x-4">
          <div className="w-20 h-20 bg-gradient-to-br from-[#433d8b] to-[#c8acd6] rounded-full flex items-center justify-center shadow-glow">
            <FaUser className="text-[#c8acd6] text-2xl" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold gradient-text">{session.user.username}</h1>
            <p className="text-[#c8acd6]">{session.user.email}</p>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <FaTrophy className="text-yellow-500" />
                <span className="text-sm text-[#c8acd6]">Reputation: {calculateReputation()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FaCalendar className="text-[#433d8b]" />
                <span className="text-sm text-[#c8acd6]">Member since {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <Link 
            href="/profile/edit" 
            className="btn btn-primary flex items-center space-x-2 text-lg"
          >
            <FaEdit />
            <span>Edit Profile</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="card p-6 flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#433d8b] to-[#c8acd6] bg-opacity-20 rounded-lg flex items-center justify-center">
              <FaQuestion className="text-[#c8acd6]" />
            </div>
            <div>
              <p className="text-2xl font-bold gradient-text">{questions.length}</p>
              <p className="text-[#c8acd6]">Questions</p>
            </div>
          </div>
          <div className="card p-6 flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#433d8b] to-[#c8acd6] bg-opacity-20 rounded-lg flex items-center justify-center">
              <FaComment className="text-[#c8acd6]" />
            </div>
            <div>
              <p className="text-2xl font-bold gradient-text">{answers.length}</p>
              <p className="text-[#c8acd6]">Answers</p>
            </div>
          </div>
          <div className="card p-6 flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 bg-opacity-20 rounded-lg flex items-center justify-center">
              <FaTrophy className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold gradient-text">
                {answers.filter(a => a.isAccepted).length}
              </p>
              <p className="text-[#c8acd6]">Accepted</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="border-b border-[#433d8b]">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('questions')}
                className={`py-4 px-1 border-b-2 font-medium text-lg ${
                  activeTab === 'questions'
                    ? 'border-[#c8acd6] text-[#c8acd6]'
                    : 'border-transparent text-[#433d8b] hover:text-[#c8acd6] hover:border-[#433d8b]'
                }`}
              >
                Questions ({questions.length})
              </button>
              <button
                onClick={() => setActiveTab('answers')}
                className={`py-4 px-1 border-b-2 font-medium text-lg ${
                  activeTab === 'answers'
                    ? 'border-[#c8acd6] text-[#c8acd6]'
                    : 'border-transparent text-[#433d8b] hover:text-[#c8acd6] hover:border-[#433d8b]'
                }`}
              >
                Answers ({answers.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c8acd6] mx-auto"></div>
                <p className="mt-2 text-[#c8acd6]">Loading...</p>
              </div>
            ) : activeTab === 'questions' ? (
              <div className="space-y-4">
                {questions.length === 0 ? (
                  <div className="text-center py-8">
                    <FaQuestion className="mx-auto h-12 w-12 text-[#433d8b]" />
                    <h3 className="mt-2 text-lg font-medium text-[#c8acd6]">No questions yet</h3>
                    <p className="mt-1 text-md text-[#c8acd6]">Get started by asking your first question.</p>
                    <div className="mt-6">
                      <Link
                        href="/questions/ask"
                        className="btn btn-primary px-4 py-2 text-lg"
                      >
                        Ask Question
                      </Link>
                    </div>
                  </div>
                ) : (
                  questions.map((question) => (
                    <div key={question._id} className="card p-4">
                      <Link href={`/questions/${question._id}`} className="block">
                        <h3 className="text-lg font-medium gradient-text mb-2">
                          {question.title}
                        </h3>
                      </Link>
                      <p className="text-[#c8acd6] text-md mb-3 line-clamp-2">{question.content}</p>
                      <div className="flex items-center justify-between text-md text-[#433d8b]">
                        <div className="flex items-center space-x-4">
                          <span>{question.views} views</span>
                          <span>{question.answers} answers</span>
                          <span>{question.votes.upvotes.length - question.votes.downvotes.length} votes</span>
                        </div>
                        <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {answers.length === 0 ? (
                  <div className="text-center py-8">
                    <FaComment className="mx-auto h-12 w-12 text-[#433d8b]" />
                    <h3 className="mt-2 text-lg font-medium text-[#c8acd6]">No answers yet</h3>
                    <p className="mt-1 text-md text-[#c8acd6]">Start helping others by answering questions.</p>
                    <div className="mt-6">
                      <Link
                        href="/questions"
                        className="btn btn-primary px-4 py-2 text-lg"
                      >
                        Browse Questions
                      </Link>
                    </div>
                  </div>
                ) : (
                  answers.map((answer) => (
                    <div key={answer._id} className="card p-4">
                      <Link href={`/questions/${answer.question._id}`} className="block">
                        <h3 className="text-lg font-medium gradient-text mb-2">
                          {answer.question.title}
                        </h3>
                      </Link>
                      <p className="text-[#c8acd6] text-md mb-3 line-clamp-2">{answer.content}</p>
                      <div className="flex items-center justify-between text-md text-[#433d8b]">
                        <div className="flex items-center space-x-4">
                          <span>{answer.isAccepted ? 'Accepted' : 'Not accepted'}</span>
                          <span>{answer.votes.upvotes.length - answer.votes.downvotes.length} votes</span>
                        </div>
                        <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 