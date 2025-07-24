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
import { Dialog } from '@headlessui/react';

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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState('');

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
  }, [searchParams.get('search')]);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams();
      const urlSearch = searchParams.get('search') || '';
      if (urlSearch) params.append('search', urlSearch);
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

  const applyFilters = () => {
    fetchQuestions();
  };

  const getVoteCount = (votes: { upvotes: string[]; downvotes: string[] }) => {
    return votes.upvotes.length - votes.downvotes.length;
  };

  // Filter questions client-side for answered/unanswered/tags
  const filteredQuestions = questions.filter((q) => {
    if (filterBy === 'answered') return q.answers > 0;
    if (filterBy === 'unanswered') return q.answers === 0;
    if (filterBy === 'accepted') return q.isAccepted;
    return true;
  }).filter((q) => selectedTags.length === 0 || q.tags.some(t => selectedTags.includes(typeof t === 'string' ? t : t.name)));

  // Tag search and selection logic
  const displayedTags = [
    ...selectedTags.map(tagName => availableTags.find(t => t.name === tagName)).filter(Boolean),
    ...availableTags.filter(t => !selectedTags.includes(t.name) && t.name.toLowerCase().includes(tagSearch.toLowerCase())),
  ];

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 m-0 p-0">
          {/* Left Panel: Filters */}
          <aside className="lg:col-span-3 hidden lg:block p-0 m-0">
            <div className="card p-4 sticky top-16 m-0">
              <h3 className="text-xl font-bold gradient-text mb-4 flex items-center gap-2">
                <FiFilter className="w-5 h-5" /> Filters
              </h3>
              {/* Sort By */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#c8acd6] mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input bg-[#181a2a] border-[#433d8b] text-[#c8acd6] focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="votes">Most Voted</option>
                  <option value="views">Most Viewed</option>
                  <option value="answers">Most Answered</option>
                </select>
              </div>
              {/* Filter By */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#c8acd6] mb-2">Filter By</label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="input bg-[#181a2a] border-[#433d8b] text-[#c8acd6] focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All Questions</option>
                  <option value="unanswered">Unanswered</option>
                  <option value="answered">Answered</option>
                  <option value="accepted">Accepted</option>
                </select>
              </div>
              {/* Tags */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#c8acd6] mb-3">Filter by Tags</label>
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={tagSearch}
                  onChange={e => setTagSearch(e.target.value)}
                  className="input mb-2 bg-[#181a2a] border-[#433d8b] text-[#c8acd6] focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {displayedTags.map((tag) => (
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
                          <span className="absolute bottom-0 right-0 bg-green-500 rounded-full p-0.5">
                            <FiCheck className="w-3 h-3 text-white" />
                          </span>
                        )}
                      </button>
                    ) : null
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline w-full mt-4"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
              <button
                type="button"
                className="btn btn-primary w-full mt-2"
                onClick={applyFilters}
              >
                Apply Filter
              </button>
            </div>
          </aside>
          {/* Center: Questions List */}
          <main className="lg:col-span-7 w-full flex flex-col items-center p-0 m-0">
            {/* Questions List */}
            {filteredQuestions.length === 0 ? (
              <div className="card p-8 text-center m-0">
                <FiSearch className="mx-auto h-16 w-16 text-[#433d8b] mb-4" />
                <h3 className="text-xl font-medium text-[#c8acd6] mb-2">No questions found</h3>
                <p className="text-[#c8acd6] mb-6">Try adjusting your search or filters.</p>
                <Link href="/questions/ask" className="btn btn-primary text-lg px-8 py-3 whitespace-nowrap">
                  <FiPlus className="w-4 h-4 mr-2 inline" />
                  Ask the First Question
                </Link>
              </div>
            ) : (
              filteredQuestions.map((question) => (
                <div key={question._id} className="card p-4 hover-lift w-full m-0">
                  <div className="flex items-start space-x-4">
                    {/* Vote Stats */}
                    <div className="flex flex-col items-center space-y-2 min-w-[60px]">
                      <div className="flex items-center space-x-1">
                        <FiThumbsUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-[#c8acd6]">{question.votes.upvotes.length}</span>
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
                          <Link key={typeof tag === 'string' ? tag : tag.name} href={`/tags/${typeof tag === 'string' ? tag : tag.name}`} className="tag cursor-pointer">
                            <FiTag className="w-3 h-3 mr-1" />
                            {typeof tag === 'string' ? tag : tag.name}
                          </Link>
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
                            <div className="flex items-center space-x-1 ml-auto" title="Accepted answer">
                              <FiCheck className="w-5 h-5 text-green-500" />
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
          </main>
        </div>
      </main>
    </div>
  );
} 