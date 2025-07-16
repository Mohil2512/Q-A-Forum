'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
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
  FiTrash2
} from 'react-icons/fi';
import Header from '@/components/Header';
import RichTextEditor from '@/components/RichTextEditor';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import Modal from '@/components/Modal';

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
}

export default function QuestionPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
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
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: answerContent,
          questionId: id,
          images: answerImages,
          ...(session ? {} : { anonUserId }),
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <main className="container-responsive py-8">
        {/* Question Header */}
        <div className="card mb-6">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-100 mb-2">{question.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <FiClock className="w-4 h-4" />
                    <span>Asked {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FiEye className="w-4 h-4" />
                    <span>{question.views} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FiMessageSquare className="w-4 h-4" />
                    <span>{answers.length} answers</span>
                  </div>
                </div>
              </div>
              {canEditOrDelete(question.author) && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => router.push(`/questions/${question._id}/edit`)}
                    className="btn btn-outline flex items-center gap-2"
                    title="Edit question"
                  >
                    <FiEdit className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={handleDeleteQuestion}
                    className="btn btn-outline text-red-400 border-red-400 flex items-center gap-2"
                    title="Delete question"
                  >
                    <FiTrash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Question Content */}
          <div className="p-6">
            <div className="flex gap-6">
              {/* Vote Controls */}
              <div className="flex flex-col items-center space-y-2">
                <button
                  onClick={() => handleVote('question', question._id, 'upvote')}
                  className={`p-3 rounded-xl hover:bg-white/5 transition-all duration-300 ${
                    hasUpvotedQuestion ? 'text-green-400 bg-green-400/10' : 'text-gray-400'
                  }`}
                  disabled={!session}
                  title="Upvote"
                >
                  <FiThumbsUp className="w-6 h-6" />
                </button>
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-sm font-medium text-green-400">
                    {question.votes.upvotes.length}
                  </span>
                  <span className="text-xl font-bold text-gray-100">
                    {questionVoteCount}
                  </span>
                  <span className="text-sm font-medium text-red-400">
                    {question.votes.downvotes.length}
                  </span>
                </div>
                <button
                  onClick={() => handleVote('question', question._id, 'downvote')}
                  className={`p-3 rounded-xl hover:bg-white/5 transition-all duration-300 ${
                    hasDownvotedQuestion ? 'text-red-400 bg-red-400/10' : 'text-gray-400'
                  }`}
                  disabled={!session}
                  title="Downvote"
                >
                  <FiThumbsDown className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div 
                  className="prose max-w-none mb-6 text-gray-100 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: question.content }}
                />

                {/* Images */}
                {question.images && question.images.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-100 mb-3 flex items-center">
                      <FiImage className="w-4 h-4 mr-2" />
                      Attached Images
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {question.images.map((image, index) => (
                        <div key={index} className="border border-white/10 rounded-xl overflow-hidden">
                          <img
                            src={image}
                            alt={`Question image ${index + 1}`}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {question.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="tag"
                    >
                      <FiTag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <FiUser className="text-white w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-100">{question.author.username}</div>
                      <div className="text-sm text-gray-400">Reputation: {question.author.reputation}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">
            {answers.length} Answer{answers.length !== 1 ? 's' : ''}
          </h2>

          {answers.length === 0 ? (
            <div className="card p-8 text-center">
              <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-100 mb-2">No answers yet</h3>
              <p className="text-gray-400 mb-4">Be the first to answer this question!</p>
              {!session && (
                <button 
                  onClick={() => router.push('/auth/signin')}
                  className="btn btn-primary"
                >
                  Sign in to Answer
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {answers.map((answer) => {
                const voteCount = answer.votes.upvotes.length - answer.votes.downvotes.length;
                const hasUpvoted = session && answer.votes.upvotes.includes(session.user.id);
                const hasDownvoted = session && answer.votes.downvotes.includes(session.user.id);
                const canEdit = canEditOrDelete(answer.author);

                return (
                  <div
                    key={answer._id}
                    className={`card ${
                      answer.isAccepted ? 'border-2 border-green-500 bg-green-500/5' : ''
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex gap-6">
                        {/* Vote Controls */}
                        <div className="flex flex-col items-center space-y-2">
                          <button
                            onClick={() => handleVote('answer', answer._id, 'upvote')}
                            className={`p-3 rounded-xl hover:bg-white/5 transition-all duration-300 ${
                              hasUpvoted ? 'text-green-400 bg-green-400/10' : 'text-gray-400'
                            }`}
                            disabled={!session}
                            title="Upvote"
                          >
                            <FiThumbsUp className="w-6 h-6" />
                          </button>
                          <div className="flex flex-col items-center space-y-1">
                            <span className="text-sm font-medium text-green-400">
                              {answer.votes.upvotes.length}
                            </span>
                            <span className="text-xl font-bold text-gray-100">
                              {voteCount}
                            </span>
                            <span className="text-sm font-medium text-red-400">
                              {answer.votes.downvotes.length}
                            </span>
                          </div>
                          <button
                            onClick={() => handleVote('answer', answer._id, 'downvote')}
                            className={`p-3 rounded-xl hover:bg-white/5 transition-all duration-300 ${
                              hasDownvoted ? 'text-red-400 bg-red-400/10' : 'text-gray-400'
                            }`}
                            disabled={!session}
                            title="Downvote"
                          >
                            <FiThumbsDown className="w-6 h-6" />
                          </button>
                          
                          {/* Accept Answer Button */}
                          {session && question.author._id === session.user.id && !question.isAccepted && (
                            <button
                              onClick={() => handleAcceptAnswer(answer._id)}
                              className="p-3 text-green-400 hover:bg-green-400/10 rounded-xl transition-all duration-300"
                              title="Accept this answer"
                            >
                              <FiCheck className="w-6 h-6" />
                            </button>
                          )}
                          
                          {answer.isAccepted && (
                            <div className="p-3 text-green-400 bg-green-400/10 rounded-xl">
                              <FiCheck className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        {/* Answer Content */}
                        <div className="flex-1">
                          <div 
                            className="prose max-w-none mb-4 text-gray-100 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: answer.content }}
                          />

                          {/* Answer Images */}
                          {answer.images && answer.images.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-100 mb-3 flex items-center">
                                <FiImage className="w-4 h-4 mr-2" />
                                Attached Images
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {answer.images.map((image, index) => (
                                  <div key={index} className="border border-white/10 rounded-xl overflow-hidden">
                                    <img
                                      src={image}
                                      alt={`Answer image ${index + 1}`}
                                      className="w-full h-48 object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Meta Info */}
                          <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <FiUser className="text-white w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-100">{answer.author.username}</div>
                                <div className="text-sm text-gray-400">Reputation: {answer.author.reputation}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="text-sm text-gray-400">
                                {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                              </div>
                              {canEdit && (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => openEditModal(answer)}
                                    className="p-1 text-blue-400 hover:bg-blue-400/10 rounded transition-all duration-300"
                                    title="Edit answer"
                                  >
                                    <FiEdit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAnswer(answer._id)}
                                    className="p-1 text-red-400 hover:bg-red-400/10 rounded transition-all duration-300"
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
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Answer Form */}
        {session ? (
          <div className="card p-6">
            <h3 className="text-xl font-bold text-gray-100 mb-4">Your Answer</h3>
            <form onSubmit={handleSubmitAnswer}>
              <RichTextEditor
                value={answerContent}
                onChange={setAnswerContent}
                placeholder="Write your answer here..."
                className="mb-4"
              />
              
              {/* Image Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
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
                  <div className="mt-2 flex flex-wrap gap-2">
                    {answerImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-xl border border-white/10"
                        />
                        <button
                          type="button"
                          onClick={() => setAnswerImages(prev => prev.filter((_, i) => i !== index))}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-400 transition-all duration-300"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingAnswer || !answerContent.trim()}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingAnswer ? 'Posting...' : 'Post Answer'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card p-6 text-center">
            <h3 className="text-xl font-bold text-gray-100 mb-2">Want to answer this question?</h3>
            <p className="text-gray-400 mb-4">You can answer anonymously, or sign in for full features and reputation.</p>
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <RichTextEditor
                value={answerContent}
                onChange={setAnswerContent}
                placeholder="Write your answer here..."
                className="mb-4"
              />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
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
                <div className="mt-2 flex flex-wrap gap-2">
                  {answerImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-xl border border-white/10"
                      />
                      <button
                        type="button"
                        onClick={() => setAnswerImages(prev => prev.filter((_, i) => i !== index))}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-400 transition-all duration-300"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={submittingAnswer || !answerContent.trim()}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-full"
              >
                {submittingAnswer ? 'Posting...' : 'Answer Anonymously'}
              </button>
            </form>
            <div className="my-4 text-gray-400">or</div>
            <button 
              onClick={() => router.push('/auth/signin')}
              className="btn btn-outline w-full"
            >
              Sign In to Answer
            </button>
          </div>
        )}
      </main>

      {/* Edit Answer Modal */}
      {editingAnswer && (
        <Modal isOpen={!!editingAnswer} onClose={closeEditModal}>
          <div className="p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold text-gray-100 mb-4">Edit Your Answer</h3>
            <RichTextEditor
              value={editContent}
              onChange={setEditContent}
              placeholder="Edit your answer here..."
              className="mb-4"
            />
            {/* Image editing UI (optional, simple for now) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Attached Images
              </label>
              <div className="flex flex-wrap gap-2">
                {editImages.map((image, idx) => (
                  <div key={idx} className="relative">
                    <img src={image} alt="Edit preview" className="w-16 h-16 object-cover rounded-xl border border-white/10" />
                    <button
                      type="button"
                      onClick={() => setEditImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-400 transition-all duration-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeEditModal}
                className="btn btn-outline"
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                onClick={submitEdit}
                className="btn btn-primary"
                disabled={editLoading || !editContent.trim()}
              >
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
} 