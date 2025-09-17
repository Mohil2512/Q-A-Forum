'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { 
  FiSearch, 
  FiPlus, 
  FiEye, 
  FiMessageSquare, 
  FiThumbsUp,
  FiThumbsDown,
  FiClock,
  FiTag,
  FiUser,
  FiTrendingUp,
  FiStar,
  FiCheck
} from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Tag {
  name: string;
  count?: number;
  description?: string;
}

interface Question {
  _id: string;
  title: string;
  shortDescription: string;
  content: string;
  images: string[];
  author: {
    _id: string;
    username: string;
  };
  tags: (string | Tag)[];
  votes: {
    upvotes: string[];
    downvotes: string[];
  };
  views: number;
  answers: number;
  isAccepted: boolean;
  createdAt: string;
}

function QuestionsContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [searchResults, setSearchResults] = useState<Question[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [tagSearch, setTagSearch] = useState('');

  // Initialize from URL parameters
  useEffect(() => {
    const tagParam = searchParams.get('tag');
    if (tagParam) {
      setSelectedTags([tagParam]);
    }
    const tagsParam = searchParams.get('tags');
    if (tagsParam && !tagParam) {
      setSelectedTags(tagsParam.split(','));
    }
  }, [searchParams]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        performSearch();
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Listen for changes in search query from URL and refetch questions
  useEffect(() => {
    fetchQuestions();
  }, [searchParams.get('search'), selectedTags]);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams();
      const urlSearch = searchParams.get('search') || '';
      if (urlSearch) params.append('search', urlSearch);
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));

      const response = await fetch(`/api/questions?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (response.ok) {
        const data = await response.json();
        setAvailableTags(data.tags || []);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const response = await fetch(`/api/questions?search=${encodeURIComponent(searchQuery)}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.questions || []);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/questions?search=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
    }
  };

  const handleTagToggle = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag) 
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newSelectedTags);
    
    // Auto-apply filters immediately
    setTimeout(() => fetchQuestions(), 100); // Small delay to ensure state is updated
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    router.push('/questions');
  };

  const applyFilters = () => {
    fetchQuestions();
  };

  // Note: We've moved most filtering to the server, this is just for display
  const filteredQuestions = questions;

  // Tag search and selection logic
  const displayedTags = [
    ...selectedTags.map(tagName => availableTags.find(t => t.name === tagName)).filter(Boolean),
    ...availableTags.filter(t => !selectedTags.includes(t.name) && t.name.toLowerCase().includes(tagSearch.toLowerCase())),
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container-responsive py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <main className="container-responsive py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
          {/* Questions List */}
          <main className="xl:col-span-10 w-full">
            {/* Tag Filter Bar */}
            <div className="card p-4 mb-6">
              <h3 className="text-lg font-semibold mb-3 gradient-text">Filter by Tags</h3>
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={tagSearch}
                  onChange={e => setTagSearch(e.target.value)}
                  className="input bg-[#181a2a] border-[#433d8b] text-[#c8acd6] focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {displayedTags.slice(0, 20).map((tag) => (
                  tag ? (
                    <button
                      key={tag.name}
                      type="button"
                      onClick={() => handleTagToggle(tag.name)}
                      className={`relative tag ${selectedTags.includes(tag.name) ? 'bg-[#433d8b]/40 border-[#c8acd6]/50' : 'bg-[#433d8b]/20 border-[#433d8b]/30'}`}
                    >
                      <FiTag className="w-3 h-3 mr-1" />
                      {tag.name}
                      {selectedTags.includes(tag.name) && (
                        <span className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                          <FiCheck className="w-2 h-2 text-white" />
                        </span>
                      )}
                    </button>
                  ) : null
                ))}
              </div>
              {(selectedTags.length > 0 || tagSearch) && (
                <div className="mt-3">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
            
            {/* Questions List */}
            {filteredQuestions.length === 0 ? (
              <div className="card p-6 sm:p-8 text-center">
                <FiSearch className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-[#433d8b] mb-4" />
                <h3 className="text-lg sm:text-xl font-medium text-[#c8acd6] mb-2">No questions found</h3>
                <p className="text-[#c8acd6] mb-4 sm:mb-6 text-sm sm:text-base">Try adjusting your search or filters.</p>
                <Link href="/questions/ask" className="btn btn-primary text-sm sm:text-base lg:text-lg px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-3 whitespace-nowrap">
                  <FiPlus className="w-4 h-4 mr-2 inline" />
                  Ask the First Question
                </Link>
              </div>
            ) : (
              filteredQuestions.map((question) => (
                <div key={question._id} className="card p-3 sm:p-4 lg:p-6 hover-lift w-full mb-4 sm:mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                    {/* Vote Stats - Mobile: Horizontal, Desktop: Vertical */}
                    <div className="flex sm:flex-col items-center sm:items-center space-x-4 sm:space-x-0 sm:space-y-2 sm:min-w-[60px]">
                      <div className="flex items-center space-x-1">
                        <FiThumbsUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                        <span className="text-xs sm:text-sm font-medium text-[#c8acd6]">{question.votes.upvotes.length}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiThumbsDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                        <span className="text-xs sm:text-sm font-medium text-[#c8acd6]">{question.votes.downvotes.length}</span>
                      </div>
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/questions/${question._id}`} className="block">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold gradient-text mb-2 hover:text-[#c8acd6] transition-colors duration-200 line-clamp-2">
                          {question.title}
                        </h2>
                      </Link>
                      <p className="text-[#c8acd6] mb-3 line-clamp-2 text-sm sm:text-base">{question.shortDescription}</p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                        {question.tags.slice(0, window.innerWidth < 640 ? 2 : 3).map((tag) => (
                          <Link 
                            key={typeof tag === 'string' ? tag : tag.name} 
                            href={`/tags?tag=${encodeURIComponent(typeof tag === 'string' ? tag : tag.name)}`} 
                            className="tag cursor-pointer text-xs sm:text-sm hover:bg-[#388bfd] transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FiTag className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                            {typeof tag === 'string' ? tag : tag.name}
                          </Link>
                        ))}
                        {question.tags.length > (window.innerWidth < 640 ? 2 : 3) && (
                          <span className="text-[#433d8b] text-xs sm:text-sm">+{question.tags.length - (window.innerWidth < 640 ? 2 : 3)} more</span>
                        )}
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-[#433d8b] space-y-2 sm:space-y-0">
                        <div className="flex items-center flex-wrap gap-x-3 sm:gap-x-4 gap-y-1">
                          <div className="flex items-center space-x-1">
                            <FiUser className="w-3 h-3 sm:w-4 sm:h-4" />
                            <Link 
                              href={`/users/${question.author.username}`}
                              className="truncate max-w-[120px] sm:max-w-none text-[#58a6ff] hover:text-[#c8acd6] transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {question.author.username}
                            </Link>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FiEye className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{question.views} views</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FiMessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{question.answers} answers</span>
                          </div>
                          {question.isAccepted && (
                            <div className="flex items-center space-x-1" title="Accepted answer">
                              <FiCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 text-xs sm:text-sm">
                          <FiClock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="whitespace-nowrap">{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </main>

          {/* Right Sidebar - Hidden on mobile and tablet */}
          <aside className="xl:col-span-2 hidden xl:block">
            <div className="card p-4 sticky top-20">
              <h3 className="text-lg font-bold gradient-text mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{filteredQuestions.length}</div>
                  <div className="text-xs text-gray-400">Total Questions</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            </div>
            <h2 className="text-xl font-semibold text-[#c8acd6] mb-2">Loading Questions...</h2>
            <p className="text-gray-400">Please wait...</p>
          </div>
        </div>
      </div>
    }>
      <QuestionsContent />
    </Suspense>
  );
} 