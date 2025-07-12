'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { 
  FiSearch, 
  FiFilter, 
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
import Header from '@/components/Header';
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
    reputation: number;
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

export default function QuestionsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [searchResults, setSearchResults] = useState<Question[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

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

  useEffect(() => {
    fetchQuestions();
    fetchTags();
  }, [sortBy, filterBy, selectedTags]);

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));
      if (sortBy !== 'newest') params.append('sort', sortBy);
      if (filterBy !== 'all') params.append('filter', filterBy);

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
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setSortBy('newest');
    setFilterBy('all');
    router.push('/questions');
  };

  const getVoteCount = (votes: { upvotes: string[]; downvotes: string[] }) => {
    return votes.upvotes.length - votes.downvotes.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
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
      <Header />
      
      <main className="container-responsive py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Questions
            </h1>
            <p className="text-gray-300 text-lg">
              Find answers to your programming questions or help others
            </p>
          </div>
          
          {session && (
            <Link 
              href="/questions/ask" 
              className="btn btn-primary mt-4 lg:mt-0 text-lg"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Ask Question
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <div className="card p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-12 text-lg"
              />
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#433d8b] w-5 h-5" />
              {isSearching && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#c8acd6]"></div>
                </div>
              )}
            </form>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 card overflow-hidden z-50">
                {searchResults.map((question) => (
                  <Link
                    key={question._id}
                    href={`/questions/${question._id}`}
                    className="block px-4 py-3 hover:bg-[#433d8b]/10 transition-colors duration-200 border-b border-[#433d8b]/20 last:border-b-0"
                    onClick={() => {
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }}
                  >
                    <div className="text-[#c8acd6] font-medium line-clamp-1">{question.title}</div>
                    <div className="text-[#433d8b] text-sm line-clamp-1">{question.shortDescription}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-[#c8acd6] mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="votes">Most Voted</option>
                <option value="views">Most Viewed</option>
                <option value="answers">Most Answered</option>
              </select>
            </div>

            {/* Filter By */}
            <div>
              <label className="block text-sm font-medium text-[#c8acd6] mb-2">Filter By</label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="input"
              >
                <option value="all">All Questions</option>
                <option value="unanswered">Unanswered</option>
                <option value="answered">Answered</option>
                <option value="accepted">Accepted</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="btn btn-outline w-full text-lg"
              >
                <FiFilter className="w-4 h-4 mr-2" />
                Clear Filters
              </button>
            </div>
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-[#c8acd6] mb-3">Filter by Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.slice(0, 10).map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => handleTagToggle(tag.name)}
                    className={`tag ${
                      selectedTags.includes(tag.name) 
                        ? 'bg-[#433d8b]/40 border-[#c8acd6]/50' 
                        : 'bg-[#433d8b]/20 border-[#433d8b]/30'
                    }`}
                  >
                    <FiTag className="w-3 h-3 mr-1" />
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {questions.length === 0 ? (
            <div className="card p-12 text-center">
              <FiSearch className="mx-auto h-16 w-16 text-[#433d8b] mb-4" />
              <h3 className="text-xl font-medium text-[#c8acd6] mb-2">No questions found</h3>
              <p className="text-[#c8acd6] mb-6">Try adjusting your search or filters.</p>
              {session && (
                <Link href="/questions/ask" className="btn btn-primary text-lg">
                  <FiPlus className="w-4 h-4 mr-2" />
                  Ask the First Question
                </Link>
              )}
            </div>
          ) : (
            questions.map((question) => (
              <div key={question._id} className="card p-6 hover-lift">
                <div className="flex items-start space-x-4">
                  {/* Vote Stats */}
                  <div className="flex flex-col items-center space-y-2 min-w-[60px]">
                    <div className="flex items-center space-x-1">
                      <FiThumbsUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-[#c8acd6]">{question.votes.upvotes.length}</span>
                    </div>
                    <div className="text-lg font-bold gradient-text">
                      {getVoteCount(question.votes)}
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiThumbsDown className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-[#c8acd6]">{question.votes.downvotes.length}</span>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/questions/${question._id}`} className="block">
                      <h2 className="text-xl font-semibold gradient-text mb-2 hover:text-[#c8acd6] transition-colors duration-200">
                        {question.title}
                      </h2>
                    </Link>
                    <p className="text-[#c8acd6] mb-3 line-clamp-2">{question.shortDescription}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {question.tags.slice(0, 3).map((tag) => (
                        <span key={typeof tag === 'string' ? tag : tag.name} className="tag">
                          <FiTag className="w-3 h-3 mr-1" />
                          {typeof tag === 'string' ? tag : tag.name}
                        </span>
                      ))}
                      {question.tags.length > 3 && (
                        <span className="text-[#433d8b] text-sm">+{question.tags.length - 3} more</span>
                      )}
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-sm text-[#433d8b]">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <FiUser className="w-4 h-4" />
                          <span>{question.author.username}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FiEye className="w-4 h-4" />
                          <span>{question.views} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FiMessageSquare className="w-4 h-4" />
                          <span>{question.answers} answers</span>
                        </div>
                        {question.isAccepted && (
                          <div className="flex items-center space-x-1">
                            <FiCheck className="w-4 h-4 text-green-500" />
                            <span className="text-green-500">Accepted</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiClock className="w-4 h-4" />
                        <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
} 