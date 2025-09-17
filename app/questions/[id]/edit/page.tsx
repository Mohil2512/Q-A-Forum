'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FiUpload, FiX, FiAlertCircle, FiTag, FiImage, FiEdit3, FiArrowLeft } from 'react-icons/fi';
import RichTextEditor from '@/components/RichTextEditor';
import toast from 'react-hot-toast';

interface Question {
  _id: string;
  title: string;
  content: string;
  shortDescription: string;
  tags: string[];
  images: (string | {
    url: string;
    publicId: string;
    width?: number;
    height?: number;
    format?: string;
  })[];
  author: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

interface QuestionForm {
  title: string;
  shortDescription: string;
  content: string;
  tags: string[];
  images: File[];
}

export default function EditQuestionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingQuestion, setFetchingQuestion] = useState(true);
  const [tagInput, setTagInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<QuestionForm>({
    title: '',
    shortDescription: '',
    content: '',
    tags: [],
    images: []
  });

  useEffect(() => {
    if (id) {
      fetchQuestion();
    }
  }, [id]);

  useEffect(() => {
    if (question) {
      setFormData({
        title: question.title,
        shortDescription: question.shortDescription,
        content: question.content,
        tags: question.tags,
        images: []
      });
      
      // Set existing images preview
      const existingImages = question.images.map(img => 
        typeof img === 'string' ? img : img.url
      );
      setImagePreview(existingImages);
    }
  }, [question]);

  const fetchQuestion = async () => {
    try {
      const response = await fetch(`/api/questions/${id}`);
      if (response.ok) {
        const data = await response.json();
        setQuestion(data.question);
      } else {
        toast.error('Question not found');
        router.push('/questions');
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      toast.error('Failed to load question');
      router.push('/questions');
    } finally {
      setFetchingQuestion(false);
    }
  };

  const handleInputChange = (field: keyof QuestionForm, value: string | string[] | File[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
        handleInputChange('tags', [...formData.tags, tag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate number of images
    if (formData.images.length + files.length > 2) {
      toast.error('You can upload a maximum of 2 images');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const newImages = [...formData.images, ...validFiles];
      const newPreviews = [...imagePreview];
      
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          setImagePreview([...newPreviews]);
        };
        reader.readAsDataURL(file);
      });

      handleInputChange('images', newImages);
      setImagePreview(newPreviews);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    handleInputChange('images', newImages);
    setImagePreview(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated and is the author
    if (!session) {
      toast.error('You must be logged in to edit questions');
      return;
    }

    if (!question) {
      toast.error('Question data not loaded');
      return;
    }

    if (question.author._id !== session.user.id) {
      toast.error('You can only edit your own questions');
      return;
    }

    if (!formData.title || !formData.content || formData.tags.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          tags: formData.tags,
          shortDescription: formData.shortDescription
        }),
      });

      if (response.ok) {
        toast.success('Question updated successfully!');
        router.push(`/questions/${id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update question');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('An error occurred while updating your question');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container-responsive py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading question...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container-responsive py-8">
          <div className="card text-center max-w-md mx-auto">
            <FiAlertCircle className="mx-auto h-12 w-12 text-purple-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-4">Sign In Required</h2>
            <p className="text-gray-400 mb-6">Please sign in to edit questions.</p>
            <Link href="/auth/signin" className="btn btn-primary">Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container-responsive py-8">
          <div className="card text-center max-w-md mx-auto">
            <FiAlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-4">Question Not Found</h2>
            <p className="text-gray-400 mb-6">The question you're trying to edit could not be found.</p>
            <Link href="/questions" className="btn btn-primary">Back to Questions</Link>
          </div>
        </div>
      </div>
    );
  }

  if (question.author._id !== session.user.id) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container-responsive py-8">
          <div className="card text-center max-w-md mx-auto">
            <FiAlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-4">Access Denied</h2>
            <p className="text-gray-400 mb-6">You can only edit your own questions.</p>
            <Link href={`/questions/${id}`} className="btn btn-primary">View Question</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <main className="container-responsive py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href={`/questions/${id}`}
              className="btn btn-outline flex items-center gap-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Question
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            Edit Question
          </h1>
          <p className="text-gray-400">
            Update your question to get better answers from the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <FiEdit3 className="w-6 h-6 mr-2" />
                Question Details
              </h2>

              {/* Title */}
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="input"
                  placeholder="Be specific and imagine you're asking a question to another person"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/200 characters
                </p>
              </div>

              {/* Short Description */}
              <div className="mb-6">
                <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-300 mb-2">
                  Short Description
                </label>
                <input
                  type="text"
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  className="input"
                  placeholder="Brief summary of your question (optional)"
                  maxLength={150}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.shortDescription.length}/150 characters
                </p>
              </div>

              {/* Content */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Question Details <span className="text-red-400">*</span>
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => handleInputChange('content', value)}
                  placeholder="Provide all the details. What did you try and what were you expecting?"
                />
              </div>

              {/* Tags */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags <span className="text-red-400">*</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-purple-600 text-white text-sm"
                    >
                      <FiTag className="w-3 h-3 mr-1" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-purple-200 hover:text-white"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInput}
                  className="input"
                  placeholder="Enter tags and press Enter (max 5)"
                  disabled={formData.tags.length >= 5}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Press Enter or comma to add tags. Maximum 5 tags.
                </p>
              </div>

              {/* Images */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiImage className="w-4 h-4" />
                  Images (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="input"
                  disabled={formData.images.length >= 2}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload up to 2 images (max 5MB each)
                </p>
                
                {imagePreview.length > 0 && (
                  <div className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      {imagePreview.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-600"
                          />
                          {index < formData.images.length && (
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <FiX className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <Link 
                href={`/questions/${id}`} 
                className="btn btn-outline text-lg flex-1 flex items-center justify-center gap-2"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary text-lg flex-1 flex items-center justify-center gap-2 focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <FiEdit3 className="w-4 h-4" />
                    <span>Update Question</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
