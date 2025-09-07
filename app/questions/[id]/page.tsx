'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { 
  FiThumbsUp, 
  FiThumbsDown, 
  FiCheck, 
  FiMessageSquare, 
  FiEye, 
  FiClock,
  FiUser,
  FiTag,
  FiImage,
  FiEdit,
  FiTrash2,
  FiStar,
  FiTrendingUp
} from 'react-icons/fi';
import Header from '@/components/Header';
import RichTextEditor from '@/components/RichTextEditor';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import Modal from '@/components/Modal';
import { Session } from 'next-auth';

interface Question {
  _id: string;
  title: string;
  content: string;
  shortDescription: string;
  images: string[];
  author: {
    _id: string;
    username: string;
    reputation: number;
  };
  tags: string[];
  votes: {
    upvotes: string[];
    downvotes: string[];
  };
  views: number;
  answers: number;
  isAccepted: boolean;
  acceptedAnswer?: string;
  createdAt: string;
  anonymous: boolean;
  anonymousId?: string;
  anonymousName?: string;
}

interface Answer {
  _id: string;
  content: string;
  images: string[];
  author: {
    _id: string;
    username: string;
    reputation: number;
  };
  votes: {
    upvotes: string[];
    downvotes: string[];
  };
  isAccepted: boolean;
  createdAt: string;
  anonymous: boolean;
  anonymousId?: string;
  anonymousName?: string;
}

// Define a type for user with id, anonymousId, and anonymousName
interface UserWithAnon {
  id?: string;
  anonymousId?: string;
  anonymousName?: string;
}

export default function QuestionPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user as UserWithAnon | undefined;
  const [postAnonymously, setPostAnonymously] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [answerContent, setAnswerContent] = useState('');
  const [answerImages, setAnswerImages] = useState<string[]>([]);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  // Anonymous ID logic
  const [anonUserId, setAnonUserId] = useState<string | null>(null);
  useEffect(() => {
    if (!session) {
      let stored = localStorage.getItem('anonUserId');
      if (!stored) {
        stored = uuidv4();
        localStorage.setItem('anonUserId', stored);
      }
      setAnonUserId(stored);
    }
  }, [session]);

  useEffect(() => {
    if (id) {
      fetchQuestion();
    }
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const response = await fetch(`/api/questions/${id}`);
      if (response.ok) {
        const data = await response.json();
        setQuestion(data.question);
        setAnswers(data.answers);
      } else {
        toast.error('Question not found');
        router.push('/questions');
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      toast.error('Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (type: 'question' | 'answer', itemId: string, voteType: 'upvote' | 'downvote') => {
    if (!session) {
      toast.error('Please sign in to vote');
      return;
    }

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, itemId, voteType }),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        
        if (type === 'question') {
          setQuestion(prev => prev ? { ...prev, votes: updatedItem.votes } : null);
        } else {
          setAnswers(prev => prev.map(answer => 
            answer._id === itemId ? { ...answer, votes: updatedItem.votes } : answer
          ));
        }
        toast.success('Vote recorded successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session && !anonUserId) {
      toast.error('Anonymous ID not available. Please refresh and try again.');
      return;
    }

    if (!answerContent.trim()) {
      toast.error('Please write an answer');
      return;
    }

    setSubmittingAnswer(true);

    try {
      let anonymousFields = {};
      if (session && postAnonymously) {
        anonymousFields = {
          anonymous: true,
          anonymousId: user?.anonymousId || '',
          anonymousName: user?.anonymousName || 'anon',
          realAuthor: user?.id,
        };
      } else if (!session && anonUserId) {
        anonymousFields = {
          anonymous: true,
          anonymousId: anonUserId,
          anonymousName: 'anon-guest',
        };
      }
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: answerContent,
          questionId: id,
          images: answerImages,
          ...anonymousFields,
        }),
      });

      if (response.ok) {
        const newAnswer = await response.json();
        setAnswers(prev => [newAnswer, ...prev]);
        setAnswerContent('');
        setAnswerImages([]);
        toast.success('Answer posted successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to post answer');
      }
    } catch (error) {
      console.error('Error posting answer:', error);
      toast.error('Failed to post answer');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!session) {
      toast.error('Please sign in to accept answers');
      return;
    }

    try {
      const response = await fetch(`/api/answers/${answerId}/accept`, {
        method: 'PUT',
      });

      if (response.ok) {
        setAnswers(prev => prev.map(answer => ({
          ...answer,
          isAccepted: answer._id === answerId
        })));
        setQuestion(prev => prev ? { ...prev, isAccepted: true, acceptedAnswer: answerId } : null);
        toast.success('Answer accepted!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to accept answer');
      }
    } catch (error) {
      console.error('Error accepting answer:', error);
      toast.error('Failed to accept answer');
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!session && !anonUserId) {
      toast.error('Anonymous ID not available. Please refresh and try again.');
      return;
    }
    if (!confirm('Are you sure you want to delete this answer?')) {
      return;
    }
    try {
      const response = await fetch(`/api/answers/${answerId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: session ? undefined : JSON.stringify({ anonUserId }),
      });
      if (response.ok) {
        setAnswers(prev => prev.filter(answer => answer._id !== answerId));
        toast.success('Answer deleted successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete answer');
      }
    } catch (error) {
      console.error('Error deleting answer:', error);
      toast.error('Failed to delete answer');
    }
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAnswerImages(prev => [...prev, data.url]);
        toast.success('Image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  // Helper to get author id as string
  const getAuthorId = (author: any) => typeof author === 'string' ? author : author?._id;
  // Helper to check if current user (session or anon) can edit/delete a post
  const canEditOrDelete = (author: any) => {
    const authorId = getAuthorId(author);
    if (session && session.user.id === authorId) return true;
    if (!session && anonUserId && authorId === anonUserId) return true;
    return false;
  };

  const handleDeleteQuestion = async () => {
    if (!session && !anonUserId) {
      toast.error('Anonymous ID not available. Please refresh and try again.');
      return;
    }
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }
    try {
      const response = await fetch(`/api/questions/${id}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: session ? undefined : JSON.stringify({ anonUserId }),
        }
      );
      if (response.ok) {
        toast.success('Question deleted successfully');
        router.push('/questions');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const handleEditAnswer = (answerId: string, content?: string, images?: string[]) => {
    // This function should be called with new content/images when editing
    if (!session && !anonUserId) {
      toast.error('Anonymous ID not available. Please refresh and try again.');
      return;
    }
    // You may want to show a modal to edit, here is the fetch logic:
    fetch(`/api/answers/${answerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, images, ...(session ? {} : { anonUserId }) }),
    })
      .then(async (response) => {
        if (response.ok) {
          const updated = await response.json();
          setAnswers(prev => prev.map(a => a._id === answerId ? { ...a, ...updated } : a));
          toast.success('Answer updated successfully');
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to update answer');
        }
      })
      .catch((error) => {
        console.error('Error updating answer:', error);
        toast.error('Failed to update answer');
      });
  };

  const [editingAnswer, setEditingAnswer] = useState<Answer | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);

  const openEditModal = (answer: Answer) => {
    setEditingAnswer(answer);
    setEditContent(answer.content);
    setEditImages(answer.images || []);
  };
  const closeEditModal = () => {
    setEditingAnswer(null);
    setEditContent('');
    setEditImages([]);
  };
  const submitEdit = async () => {
    if (!editContent.trim()) {
      toast.error('Please write an answer');
      return;
    }
    setEditLoading(true);
    await handleEditAnswer(editingAnswer!._id, editContent, editImages);
    setEditLoading(false);
    closeEditModal();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="container-responsive py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading question...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  const questionVoteCount = question.votes.upvotes.length - question.votes.downvotes.length;
  const hasUpvotedQuestion = session && question.votes.upvotes.includes(session.user.id);
  const hasDownvotedQuestion = session && question.votes.downvotes.includes(session.user.id);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="container-responsive py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
          <Link href="/questions" className="hover:text-[#58a6ff] transition-colors">
            Questions
          </Link>
          <span>/</span>
          <span className="text-gray-300 truncate max-w-md">{question.title}</span>
        </nav>

        {/* Question Card */}
        <div className="card mb-6 hover-lift transition-all duration-300">
          {/* Question Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-4 leading-tight">{question.title}</h1>
                
                {/* Question Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4" />
                    <span>Asked {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiEye className="w-4 h-4" />
                    <span>{question.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMessageSquare className="w-4 h-4" />
                    <span>{answers.length} {answers.length === 1 ? 'answer' : 'answers'}</span>
                  </div>
                  {question.isAccepted && (
                    <div className="flex items-center gap-2 text-green-400">
                      <FiCheck className="w-4 h-4" />
                      <span>Solved</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {canEditOrDelete(question.author) && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => router.push(`/questions/${question._id}/edit`)}
                    className="btn btn-outline flex items-center gap-2 text-sm"
                    title="Edit question"
                  >
                    <FiEdit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteQuestion}
                    className="btn btn-outline text-red-400 border-red-400 hover:bg-red-400/10 flex items-center gap-2 text-sm"
                    title="Delete question"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Question Content */}
          <div className="p-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Vote Controls */}
              <div className="col-span-12 lg:col-span-1 order-2 lg:order-1">
                <div className="flex lg:flex-col items-center lg:items-center justify-center lg:justify-start space-x-4 lg:space-x-0 lg:space-y-3">
                  <button
                    onClick={() => handleVote('question', question._id, 'upvote')}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      hasUpvotedQuestion 
                        ? 'text-green-400 bg-green-400/20 shadow-lg shadow-green-400/25' 
                        : 'text-gray-400 hover:text-green-400 hover:bg-green-400/10'
                    }`}
                    disabled={!session}
                    title={!session ? "Sign in to vote" : "Upvote"}
                  >
                    <FiThumbsUp className="w-6 h-6" />
                  </button>
                  
                  <div className="text-center">
                    <div className="text-xs text-green-400 font-medium mb-1">
                      {question.votes.upvotes.length}
                    </div>
                    <div className={`text-2xl font-bold ${
                      questionVoteCount > 0 ? 'text-green-400' : 
                      questionVoteCount < 0 ? 'text-red-400' : 'text-gray-300'
                    }`}>
                      {questionVoteCount > 0 ? '+' : ''}{questionVoteCount}
                    </div>
                    <div className="text-xs text-red-400 font-medium mt-1">
                      {question.votes.downvotes.length}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleVote('question', question._id, 'downvote')}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      hasDownvotedQuestion 
                        ? 'text-red-400 bg-red-400/20 shadow-lg shadow-red-400/25' 
                        : 'text-gray-400 hover:text-red-400 hover:bg-red-400/10'
                    }`}
                    disabled={!session}
                    title={!session ? "Sign in to vote" : "Downvote"}
                  >
                    <FiThumbsDown className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="col-span-12 lg:col-span-11 order-1 lg:order-2">
                {/* Question Description */}
                {question.shortDescription && (
                  <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
                    <p className="text-gray-300 text-base leading-relaxed">{question.shortDescription}</p>
                  </div>
                )}

                {/* Question Content */}
                <div 
                  className="prose prose-lg max-w-none mb-6 text-gray-100 prose-headings:text-white prose-strong:text-white prose-code:text-purple-300 prose-pre:bg-[#1a1625] prose-pre:border prose-pre:border-white/10"
                  dangerouslySetInnerHTML={{ __html: question.content }}
                />

                {/* Images */}
                {question.images && question.images.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <FiImage className="w-5 h-5 mr-2 text-purple-400" />
                      Attached Images
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {question.images.map((image, index) => (
                        <div key={index} className="group relative overflow-hidden rounded-xl border border-white/10 hover:border-purple-500/50 transition-all duration-300">
                          <img
                            src={image}
                            alt={`Question image ${index + 1}`}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {question.tags.map((tag, index) => (
                    <Link 
                      key={index}
                      href={`/questions?tags=${encodeURIComponent(tag)}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 text-purple-300 text-sm font-medium rounded-lg hover:from-purple-500/20 hover:to-blue-500/20 hover:border-purple-400/50 transition-all duration-300"
                    >
                      <FiTag className="w-3 h-3" />
                      {tag}
                    </Link>
                  ))}
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                        <FiUser className="text-white w-6 h-6" />
                      </div>
                      {!question.anonymous && question.author.reputation > 100 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                          <FiStar className="w-3 h-3 text-yellow-900" />
                        </div>
                      )}
                    </div>
                    <div>
                      {question.anonymous ? (
                        <div className="font-semibold text-gray-100 text-lg">{question.anonymousName || 'Anonymous'}</div>
                      ) : (
                        <Link 
                          href={`/profile/${question.author._id || question.author}`} 
                          className="font-semibold text-gray-100 text-lg hover:text-purple-400 transition-colors"
                        >
                          {question.author.username}
                        </Link>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        {!question.anonymous && (
                          <div className="flex items-center gap-1">
                            <FiTrendingUp className="w-4 h-4" />
                            <span>{question.author.reputation.toLocaleString()} reputation</span>
                          </div>
                        )}
                        <div>Asked {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <FiMessageSquare className="w-5 h-5 text-white" />
              </div>
              {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            </h2>
            {answers.length > 0 && (
              <div className="text-sm text-gray-400">
                {answers.filter(a => a.isAccepted).length > 0 ? 'Solution found' : 'No accepted answer yet'}
              </div>
            )}
          </div>

          {answers.length === 0 ? (
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">No answers yet</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">Be the first to help solve this question and earn reputation points!</p>
              {!session && (
                <div className="space-y-3">
                  <button 
                    onClick={() => router.push('/auth/signin')}
                    className="btn btn-primary"
                  >
                    Sign in to Answer
                  </button>
                  <p className="text-sm text-gray-500">or scroll down to answer anonymously</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {answers.map((answer, index) => {
                const upvotes = answer.votes?.upvotes ?? [];
                const downvotes = answer.votes?.downvotes ?? [];
                const voteCount = upvotes.length - downvotes.length;
                const hasUpvoted = session && upvotes.includes(session.user.id);
                const hasDownvoted = session && downvotes.includes(session.user.id);
                const canEdit = canEditOrDelete(answer.author);

                return (
                  <div
                    key={answer._id}
                    className={`card hover-lift transition-all duration-300 ${
                      answer.isAccepted 
                        ? 'border-2 border-green-500 bg-gradient-to-r from-green-500/5 to-green-400/5 shadow-lg shadow-green-500/10' 
                        : 'border border-white/10'
                    }`}
                  >
                    {answer.isAccepted && (
                      <div className="bg-gradient-to-r from-green-500 to-green-400 text-white px-4 py-2 text-sm font-medium flex items-center gap-2">
                        <FiCheck className="w-4 h-4" />
                        Accepted Answer
                      </div>
                    )}
                    <div className="p-6">
                      <div className="grid grid-cols-12 gap-6">
                        {/* Vote Controls */}
                        <div className="col-span-12 lg:col-span-1 order-2 lg:order-1">
                          <div className="flex lg:flex-col items-center lg:items-center justify-center lg:justify-start space-x-4 lg:space-x-0 lg:space-y-3">
                            <button
                              onClick={() => handleVote('answer', answer._id, 'upvote')}
                              className={`p-3 rounded-xl transition-all duration-300 ${
                                hasUpvoted 
                                  ? 'text-green-400 bg-green-400/20 shadow-lg shadow-green-400/25' 
                                  : 'text-gray-400 hover:text-green-400 hover:bg-green-400/10'
                              }`}
                              disabled={!session}
                              title={!session ? "Sign in to vote" : "Upvote"}
                            >
                              <FiThumbsUp className="w-6 h-6" />
                            </button>
                            
                            <div className="text-center">
                              <div className="text-xs text-green-400 font-medium mb-1">
                                {upvotes.length}
                              </div>
                              <div className={`text-2xl font-bold ${
                                voteCount > 0 ? 'text-green-400' : 
                                voteCount < 0 ? 'text-red-400' : 'text-gray-300'
                              }`}>
                                {voteCount > 0 ? '+' : ''}{voteCount}
                              </div>
                              <div className="text-xs text-red-400 font-medium mt-1">
                                {downvotes.length}
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleVote('answer', answer._id, 'downvote')}
                              className={`p-3 rounded-xl transition-all duration-300 ${
                                hasDownvoted 
                                  ? 'text-red-400 bg-red-400/20 shadow-lg shadow-red-400/25' 
                                  : 'text-gray-400 hover:text-red-400 hover:bg-red-400/10'
                              }`}
                              disabled={!session}
                              title={!session ? "Sign in to vote" : "Downvote"}
                            >
                              <FiThumbsDown className="w-6 h-6" />
                            </button>
                            
                            {/* Accept Answer Button */}
                            {session && question.author._id === session.user.id && !question.isAccepted && (
                              <button
                                onClick={() => handleAcceptAnswer(answer._id)}
                                className="p-3 text-yellow-400 hover:bg-yellow-400/20 rounded-xl transition-all duration-300 shadow-lg hover:shadow-yellow-400/25"
                                title="Accept this answer"
                              >
                                <FiCheck className="w-6 h-6" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Answer Content */}
                        <div className="col-span-12 lg:col-span-11 order-1 lg:order-2">
                          <div 
                            className="prose prose-lg max-w-none mb-6 text-gray-100 prose-headings:text-white prose-strong:text-white prose-code:text-purple-300 prose-pre:bg-[#1a1625] prose-pre:border prose-pre:border-white/10"
                            dangerouslySetInnerHTML={{ __html: answer.content }}
                          />

                          {/* Answer Images */}
                          {answer.images && answer.images.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <FiImage className="w-5 h-5 mr-2 text-blue-400" />
                                Attached Images
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {answer.images.map((image, imgIndex) => (
                                  <div key={imgIndex} className="group relative overflow-hidden rounded-xl border border-white/10 hover:border-blue-500/50 transition-all duration-300">
                                    <img
                                      src={image}
                                      alt={`Answer image ${imgIndex + 1}`}
                                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Meta Info */}
                          <div className="flex items-center justify-between pt-6 border-t border-white/10">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                                  <FiUser className="text-white w-5 h-5" />
                                </div>
                                {!answer.anonymous && answer.author.reputation > 100 && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <FiStar className="w-2.5 h-2.5 text-yellow-900" />
                                  </div>
                                )}
                              </div>
                              <div>
                                {answer.anonymous ? (
                                  <div className="font-semibold text-gray-100">{answer.anonymousName || 'Anonymous'}</div>
                                ) : (
                                  <Link 
                                    href={`/profile/${answer.author._id || answer.author}`} 
                                    className="font-semibold text-gray-100 hover:text-blue-400 transition-colors"
                                  >
                                    {answer.author.username}
                                  </Link>
                                )}
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                  {!answer.anonymous && (
                                    <div className="flex items-center gap-1">
                                      <FiTrendingUp className="w-3 h-3" />
                                      <span>{answer.author.reputation.toLocaleString()}</span>
                                    </div>
                                  )}
                                  <div>{formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}</div>
                                </div>
                              </div>
                            </div>
                            {canEdit && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openEditModal(answer)}
                                  className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all duration-300"
                                  title="Edit answer"
                                >
                                  <FiEdit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAnswer(answer._id)}
                                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-300"
                                  title="Delete answer"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Answer Form */}
        {session ? (
          <div className="card hover-lift transition-all duration-300">
            <div className="border-b border-white/10 p-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <FiEdit className="w-5 h-5 text-white" />
                </div>
                Write Your Answer
              </h3>
              <p className="text-gray-400 mt-2">Share your knowledge and help the community</p>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="flex items-center gap-3 text-purple-300 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={postAnonymously}
                    onChange={e => setPostAnonymously(e.target.checked)}
                    className="form-checkbox rounded text-purple-500 focus:ring-purple-500 bg-transparent border-purple-500"
                  />
                  <span className="flex items-center gap-2">
                    <FiUser className="w-4 h-4" />
                    Post Anonymously
                  </span>
                </label>
              </div>
              
              <form onSubmit={handleSubmitAnswer} className="space-y-6">
                <div>
                  <RichTextEditor
                    value={answerContent}
                    onChange={setAnswerContent}
                    placeholder="Write your detailed answer here... Be specific and provide examples when possible."
                    className="mb-4"
                  />
                </div>
                
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <FiImage className="w-4 h-4" />
                    Attach Images (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(handleImageUpload);
                    }}
                    className="input"
                  />
                  {answerImages.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Attached Images:</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {answerImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border border-white/10 group-hover:border-purple-500/50 transition-all duration-300"
                            />
                            <button
                              type="button"
                              onClick={() => setAnswerImages(prev => prev.filter((_, i) => i !== index))}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-all duration-300 shadow-lg"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <div className="text-sm text-gray-400">
                    By posting, you agree to our community guidelines
                  </div>
                  <button
                    type="submit"
                    disabled={submittingAnswer || !answerContent.trim()}
                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submittingAnswer ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Posting...
                      </>
                    ) : (
                      <>
                        <FiMessageSquare className="w-4 h-4" />
                        Post Answer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="card hover-lift transition-all duration-300">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiMessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Want to answer this question?</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">You can answer anonymously for quick help, or sign in for full features and reputation points.</p>
              
              <form onSubmit={handleSubmitAnswer} className="space-y-6 max-w-2xl mx-auto">
                <div>
                  <RichTextEditor
                    value={answerContent}
                    onChange={setAnswerContent}
                    placeholder="Write your answer here... Help the community with your knowledge!"
                    className="mb-4"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <FiImage className="w-4 h-4" />
                    Attach Images (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(handleImageUpload);
                    }}
                    className="input"
                  />
                  {answerImages.length > 0 && (
                    <div className="mt-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {answerImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border border-white/10 group-hover:border-purple-500/50 transition-all duration-300"
                            />
                            <button
                              type="button"
                              onClick={() => setAnswerImages(prev => prev.filter((_, i) => i !== index))}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-all duration-300 shadow-lg"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    type="submit"
                    disabled={submittingAnswer || !answerContent.trim()}
                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
                  >
                    {submittingAnswer ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Posting...
                      </>
                    ) : (
                      <>
                        <FiUser className="w-4 h-4" />
                        Answer Anonymously
                      </>
                    )}
                  </button>
                  <button 
                    type="button"
                    onClick={() => router.push('/auth/signin')}
                    className="btn btn-outline flex items-center gap-2 justify-center"
                  >
                    <FiUser className="w-4 h-4" />
                    Sign In to Answer
                  </button>
                </div>
                
                <div className="text-sm text-gray-500 text-center">
                  Sign in to earn reputation points and access more features
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Edit Answer Modal */}
      {editingAnswer && (
        <Modal isOpen={!!editingAnswer} onClose={closeEditModal}>
          <div className="w-full max-w-2xl mx-auto">
            <div className="card">
              <div className="border-b border-white/10 p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <FiEdit className="w-5 h-5 text-white" />
                  </div>
                  Edit Your Answer
                </h3>
                <p className="text-gray-400 mt-2">Update your answer to help the community better</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <RichTextEditor
                      value={editContent}
                      onChange={setEditContent}
                      placeholder="Edit your answer here..."
                      className="mb-4"
                    />
                  </div>
                  
                  {/* Image editing UI */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                      <FiImage className="w-4 h-4" />
                      Attached Images
                    </label>
                    {editImages.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {editImages.map((image, idx) => (
                          <div key={idx} className="relative group">
                            <img 
                              src={image} 
                              alt="Edit preview" 
                              className="w-full h-20 object-cover rounded-lg border border-white/10 group-hover:border-purple-500/50 transition-all duration-300" 
                            />
                            <button
                              type="button"
                              onClick={() => setEditImages(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-all duration-300 shadow-lg"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg border border-white/10">
                        <FiImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No images attached</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-6 border-t border-white/10">
                  <div className="text-sm text-gray-400">
                    Changes will be saved immediately
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={closeEditModal}
                      className="btn btn-outline"
                      disabled={editLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitEdit}
                      className="btn btn-primary flex items-center gap-2"
                      disabled={editLoading || !editContent.trim()}
                    >
                      {editLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiCheck className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
} 