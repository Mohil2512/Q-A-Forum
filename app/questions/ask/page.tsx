'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUpload, FiX, FiAlertCircle, FiTag, FiImage, FiEdit3 } from 'react-icons/fi';
import RichTextEditor from '@/components/RichTextEditor';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { Session } from 'next-auth';

// Define a type for user with id, anonymousId, and anonymousName
interface UserWithAnon {
  id?: string;
  anonymousId?: string;
  anonymousName?: string;
}

interface QuestionForm {
  title: string;
  shortDescription: string;
  content: string;
  tags: string[];
  images: File[];
  imageData: {
    url: string;
    publicId: string;
    width?: number;
    height?: number;
    format?: string;
  }[];
}

export default function AskQuestionPage() {
  const { data: session, status } = useSession();
  const user = session?.user as UserWithAnon | undefined;
  const router = useRouter();
  const [formData, setFormData] = useState<QuestionForm>({
    title: '',
    shortDescription: '',
    content: '',
    tags: [],
    images: [],
    imageData: []
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [postAnonymously, setPostAnonymously] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/questions/ask');
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login required message if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Login Required</h1>
          <p className="text-gray-300 mb-6">
            You need to be logged in to ask questions. Please sign in to continue.
          </p>
          <button
            onClick={() => router.push('/auth/signin?callbackUrl=/questions/ask')}
            className="btn btn-primary"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

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
      toast.error('Maximum 2 images allowed');
      return;
    }

    // Validate file sizes
    const validFiles = files.filter(file => {
      if (file.size > 1024 * 1024) { // 1MB
        toast.error(`${file.name} is too large. Maximum size is 1MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      handleInputChange('images', [...formData.images, ...validFiles]);
      
      // Create preview URLs
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
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
    
    // Ensure user is authenticated
    if (!session || !user) {
      toast.error('You must be logged in to ask questions');
      return;
    }

    if (!formData.title || !formData.content || formData.tags.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Upload images first and get Cloudinary data
      const imageData: {
        url: string;
        publicId: string;
        width?: number;
        height?: number;
        format?: string;
      }[] = [];
      
      for (const image of formData.images) {
        const formDataImage = new FormData();
        formDataImage.append('image', image);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataImage,
        });
        
        if (uploadResponse.ok) {
          const result = await uploadResponse.json();
          imageData.push({
            url: result.url,
            publicId: result.publicId,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        } else {
          const error = await uploadResponse.json();
          toast.error(error.error || 'Failed to upload image');
          return;
        }
      }

      // Generate anonymous display name if posting anonymously
      const anonymousDisplayName = postAnonymously 
        ? `Anonymous_${Math.random().toString(36).substr(2, 6).toUpperCase()}`
        : null;

      // Prepare question data
      const questionData = {
        title: formData.title,
        shortDescription: formData.shortDescription,
        content: formData.content,
        tags: formData.tags,
        images: imageData,
        anonymous: postAnonymously,
        anonymousDisplayName: anonymousDisplayName,
        realAuthor: user.id, // Always store the real user ID
      }

      // Create question with new authentication system
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      });

      if (response.ok) {
        const question = await response.json();
        toast.success('Question posted successfully!');
        router.push(`/questions/${question._id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to post question');
      }
    } catch (error) {
      console.error('Error posting question:', error);
      toast.error('An error occurred while posting your question');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container-responsive py-8">
          <div className="card text-center max-w-md mx-auto">
            <FiAlertCircle className="mx-auto h-12 w-12 text-purple-500 mb-4" />
            <h2 className="text-xl font-semibold gradient-text mb-2">Ask Anonymously or Sign In</h2>
            <p className="text-gray-300 mb-4">
              You can ask a question anonymously, or sign in for full features.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="card p-6">
                <label htmlFor="title" className="block text-sm font-medium text-[#c8acd6] mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="What's your question? Be specific."
                  className="input text-lg"
                  maxLength={200}
                  required
                />
                <p className="mt-1 text-sm text-[#433d8b]">
                  {formData.title.length}/200 characters
                </p>
              </div>

              {/* Short Description */}
              <div className="card p-6">
                <label htmlFor="shortDescription" className="block text-sm font-medium text-[#c8acd6] mb-2">
                  Short Description *
                </label>
                <textarea
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder="Brief summary of your question (max 200 characters)"
                  className="textarea h-20 text-lg"
                  maxLength={200}
                  required
                />
                <p className="mt-1 text-sm text-[#433d8b]">
                  {formData.shortDescription.length}/200 characters
                </p>
              </div>

              {/* Content */}
              <div className="card p-6">
                <label htmlFor="content" className="block text-sm font-medium text-[#c8acd6] mb-2">
                  Detailed Question *
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => handleInputChange('content', value)}
                  placeholder="Provide detailed information about your question. Include code examples, error messages, and any relevant context."
                />
              </div>

              {/* Tags */}
              <div className="card p-6">
                <label htmlFor="tags" className="block text-sm font-medium text-[#c8acd6] mb-2">
                  Tags * (up to 5)
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInput}
                    placeholder="Type tags and press Enter or comma (e.g., javascript, react, nodejs)"
                    className="input text-lg"
                  />
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span key={tag} className="tag">
                          <FiTag className="w-3 h-3 mr-1" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 hover:text-red-400 transition-colors duration-200"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-sm text-[#433d8b]">
                    {formData.tags.length}/5 tags
                  </p>
                </div>
              </div>

              {/* Image Upload */}
              <div className="card p-6">
                <label className="block text-sm font-medium text-[#c8acd6] mb-2">
                  Images (optional, max 2)
                </label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="btn btn-outline cursor-pointer text-lg flex items-center justify-center gap-2">
                      <FiUpload className="w-4 h-4" />
                      <span>Choose Images</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-sm text-[#433d8b]">
                      {formData.images.length}/2 images
                    </span>
                  </div>
                  
                  {imagePreview.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {imagePreview.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-[#433d8b]/30"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col gap-4 mt-6">
                <div className="flex gap-4">
                  <Link href="/questions" className="btn btn-outline text-lg flex-1 flex items-center justify-center gap-2">
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
                        Posting...
                      </>
                    ) : (
                      <>
                        <FiEdit3 className="w-4 h-4" />
                        <span>Post Question</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center my-2">
                  <div className="flex-1 h-px bg-[#433d8b]/30" />
                  <span className="mx-3 text-sm text-[#433d8b]">or</span>
                  <div className="flex-1 h-px bg-[#433d8b]/30" />
                </div>
                <Link href="/auth/signin?callbackUrl=/questions/ask" className="btn btn-outline text-lg w-full">
              Sign In
            </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <main className="container-responsive py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Ask a Question</h1>
          <p className="text-gray-300 text-lg">
            Share your knowledge and help others by asking a question.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          {/* Title */}
          <div className="card p-6">
            <label htmlFor="title" className="block text-sm font-medium text-[#c8acd6] mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="What's your question? Be specific."
              className="input text-lg"
              maxLength={200}
              required
            />
            <p className="mt-1 text-sm text-[#433d8b]">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Short Description */}
          <div className="card p-6">
            <label htmlFor="shortDescription" className="block text-sm font-medium text-[#c8acd6] mb-2">
              Short Description *
            </label>
            <textarea
              id="shortDescription"
              value={formData.shortDescription}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              placeholder="Brief summary of your question (max 200 characters)"
              className="textarea h-20 text-lg"
              maxLength={200}
              required
            />
            <p className="mt-1 text-sm text-[#433d8b]">
              {formData.shortDescription.length}/200 characters
            </p>
          </div>

          {/* Content */}
          <div className="card p-6">
            <label htmlFor="content" className="block text-sm font-medium text-[#c8acd6] mb-2">
              Detailed Question *
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => handleInputChange('content', value)}
              placeholder="Provide detailed information about your question. Include code examples, error messages, and any relevant context."
            />
          </div>

          {/* Tags */}
          <div className="card p-6">
            <label htmlFor="tags" className="block text-sm font-medium text-[#c8acd6] mb-2">
              Tags * (up to 5)
            </label>
            <div className="space-y-3">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInput}
                placeholder="Type tags and press Enter or comma (e.g., javascript, react, nodejs)"
                className="input text-lg"
              />
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span key={tag} className="tag">
                      <FiTag className="w-3 h-3 mr-1" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-red-400 transition-colors duration-200"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              <p className="text-sm text-[#433d8b]">
                {formData.tags.length}/5 tags
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div className="card p-6">
            <label className="block text-sm font-medium text-[#c8acd6] mb-2">
              Images (optional, max 2)
            </label>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="btn btn-outline cursor-pointer text-lg flex items-center justify-center gap-2">
                  <FiUpload className="w-4 h-4" />
                  <span>Choose Images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-sm text-[#433d8b]">
                  {formData.images.length}/2 images
                </span>
              </div>
              
              {imagePreview.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-[#433d8b]/30"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 items-center">
            <label className="flex items-center gap-2 text-[#c8acd6] text-sm">
              <input
                type="checkbox"
                checked={postAnonymously}
                onChange={e => setPostAnonymously(e.target.checked)}
                className="form-checkbox rounded text-purple-500 focus:ring-purple-500"
              />
              Post Anonymously
            </label>
            <Link href="/questions" className="btn btn-outline text-lg flex-1 flex items-center justify-center gap-2">
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
                  Posting...
                </>
              ) : (
                <>
                  <FiEdit3 className="w-4 h-4" />
                  <span>Post Question</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
} 