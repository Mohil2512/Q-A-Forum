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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Filters */}
          <aside className="lg:col-span-3 hidden lg:block">
            <div className="card p-6 sticky top-24">
              <h3 className="text-xl font-bold gradient-text mb-4 flex items-center gap-2">
                <FiFilter className="w-5 h-5" /> Filters
              </h3>
              {/* Sort By */}
              <div className="mb-4">
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
              <div className="mb-4">
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
              {/* Tags */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#c8acd6] mb-3">Filter by Tags</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {availableTags.slice(0, 10).map((tag) => (
                    <button
                      key={tag.name}
                      type="button"
                      onClick={() => handleTagToggle(tag.name)}
                      className={`tag ${selectedTags.includes(tag.name) ? 'bg-[#433d8b]/40 border-[#c8acd6]/50' : 'bg-[#433d8b]/20 border-[#433d8b]/30'}`}
                    >
                      <FiTag className="w-3 h-3 mr-1" />
                      {tag.name}
                    </button>
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
            </div>
          </aside>
          {/* Center: Questions List */}
          <section className="lg:col-span-6">
            {/* Search Bar */}
            <div className="card p-6 mb-8">
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
              {/* Questions List */}
              <div className="space-y-6">
                {questions.length === 0 ? (
                  <div className="card p-12 text-center">
                    <FiSearch className="mx-auto h-16 w-16 text-[#433d8b] mb-4" />
                    <h3 className="text-xl font-medium text-[#c8acd6] mb-2">No questions found</h3>
                    <p className="text-[#c8acd6] mb-6">Try adjusting your search or filters.</p>
                    <Link href="/questions/ask" className="btn btn-primary text-lg px-8 py-3 whitespace-nowrap">
                      <FiPlus className="w-4 h-4 mr-2 inline" />
                      Ask the First Question
                    </Link>
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
              </div>
            </div>
          </section>
          {/* Right Panel: Social Join */}
          <aside className="lg:col-span-3 hidden lg:block">
            <div className="flex flex-col items-center gap-6 mb-4">
              <Link href="/questions/ask" className="btn btn-primary w-full text-lg flex items-center justify-center gap-2">
                <FiPlus className="w-5 h-5" /> Ask Question
              </Link>
            </div>
            <div className="card p-6 sticky top-24 flex flex-col items-center gap-6">
              <h3 className="text-xl font-bold gradient-text mb-2">Join Us</h3>
              <a href="https://www.linkedin.com/in/mohil-pipaliya/" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 bg-[#17153b] hover:bg-[#2e236c] rounded-lg p-3 shadow hover:shadow-lg transition">
                {/* LinkedIn SVG - ensure correct rendering */}
                <span className="w-8 h-8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 50 50" fill="none">
                    <rect width="50" height="50" rx="12" fill="#18181b"/>
                    <path d="M15.5 20.5V34.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                    <circle cx="15.5" cy="16.5" r="2" fill="#fff"/>
                    <path d="M22 25.5V34.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M22 28.5C22 26.0147 24.0147 24 26.5 24C28.9853 24 31 26.0147 31 28.5V34.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </span>
                <span className="text-white font-semibold text-lg">LinkedIn</span>
              </a>
              <a href="https://github.com/Mohil2512" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 bg-[#17153b] hover:bg-[#2e236c] rounded-lg p-3 shadow hover:shadow-lg transition">
                {/* GitHub SVG */}
                <span className="w-8 h-8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="32" height="32" viewBox="0 0 50 50" style={{ fill: '#FFFFFF' }}>
                    <path d="M 25 2 C 12.311335 2 2 12.311335 2 25 C 2 37.688665 12.311335 48 25 48 C 37.688665 48 48 37.688665 48 25 C 48 12.311335 37.688665 2 25 2 z M 25 4 C 36.607335 4 46 13.392665 46 25 C 46 25.071371 45.994849 25.141688 45.994141 25.212891 C 45.354527 25.153853 44.615508 25.097776 43.675781 25.064453 C 42.347063 25.017336 40.672259 25.030987 38.773438 25.125 C 38.843852 24.634651 38.893205 24.137377 38.894531 23.626953 C 38.991361 21.754332 38.362521 20.002464 37.339844 18.455078 C 37.586913 17.601352 37.876747 16.515218 37.949219 15.283203 C 38.031819 13.878925 37.910599 12.321765 36.783203 11.269531 L 36.494141 11 L 36.099609 11 C 33.416539 11 31.580023 12.12321 30.457031 13.013672 C 28.835529 12.386022 27.01222 12 25 12 C 22.976367 12 21.135525 12.391416 19.447266 13.017578 C 18.324911 12.126691 16.486785 11 13.800781 11 L 13.408203 11 L 13.119141 11.267578 C 12.020956 12.287321 11.919778 13.801759 11.988281 15.199219 C 12.048691 16.431506 12.321732 17.552142 12.564453 18.447266 C 11.524489 20.02486 10.900391 21.822018 10.900391 23.599609 C 10.900391 24.111237 10.947969 24.610071 11.017578 25.101562 C 9.2118173 25.017808 7.6020996 25.001668 6.3242188 25.046875 C 5.3845143 25.080118 4.6454422 25.135713 4.0058594 25.195312 C 4.0052628 25.129972 4 25.065482 4 25 C 4 13.392665 13.392665 4 25 4 z M 14.396484 13.130859 C 16.414067 13.322043 17.931995 14.222972 18.634766 14.847656 L 19.103516 15.261719 L 19.681641 15.025391 C 21.263092 14.374205 23.026984 14 25 14 C 26.973016 14 28.737393 14.376076 30.199219 15.015625 L 30.785156 15.273438 L 31.263672 14.847656 C 31.966683 14.222758 33.487184 13.321554 35.505859 13.130859 C 35.774256 13.575841 36.007486 14.208668 35.951172 15.166016 C 35.883772 16.311737 35.577304 17.559658 35.345703 18.300781 L 35.195312 18.783203 L 35.494141 19.191406 C 36.483616 20.540691 36.988121 22.000937 36.902344 23.544922 L 36.900391 23.572266 L 36.900391 23.599609 C 36.900391 26.095064 36.00178 28.092339 34.087891 29.572266 C 32.174048 31.052199 29.152663 32 24.900391 32 C 20.648118 32 17.624827 31.052192 15.710938 29.572266 C 13.797047 28.092339 12.900391 26.095064 12.900391 23.599609 C 12.900391 22.134903 13.429308 20.523599 14.40625 19.191406 L 14.699219 18.792969 L 14.558594 18.318359 C 14.326866 17.530484 14.042825 16.254103 13.986328 15.101562 C 13.939338 14.14294 14.166221 13.537027 14.396484 13.130859 z M 8.8847656 26.021484 C 9.5914575 26.03051 10.40146 26.068656 11.212891 26.109375 C 11.290419 26.421172 11.378822 26.727898 11.486328 27.027344 C 8.178972 27.097092 5.7047309 27.429674 4.1796875 27.714844 C 4.1152068 27.214494 4.0638483 26.710021 4.0351562 26.199219 C 5.1622058 26.092262 6.7509972 25.994233 8.8847656 26.021484 z M 41.115234 26.037109 C 43.247527 26.010033 44.835728 26.108156 45.962891 26.214844 C 45.934234 26.718328 45.883749 27.215664 45.820312 27.708984 C 44.24077 27.41921 41.699674 27.086688 38.306641 27.033203 C 38.411945 26.739677 38.499627 26.438219 38.576172 26.132812 C 39.471291 26.084833 40.344564 26.046896 41.115234 26.037109 z M 11.912109 28.019531 C 12.508849 29.215327 13.361516 30.283019 14.488281 31.154297 C 16.028825 32.345531 18.031623 33.177838 20.476562 33.623047 C 20.156699 33.951698 19.86578 34.312595 19.607422 34.693359 L 19.546875 34.640625 C 19.552375 34.634325 19.04975 34.885878 18.298828 34.953125 C 17.547906 35.020374 16.621615 35 15.800781 35 C 14.575781 35 14.03621 34.42121 13.173828 33.367188 C 12.696283 32.72356 12.114101 32.202331 11.548828 31.806641 C 10.970021 31.401475 10.476259 31.115509 9.8652344 31.013672 L 9.7832031 31 L 9.6992188 31 C 9.2325521 31 8.7809835 31.03379 8.359375 31.515625 C 8.1485707 31.756544 8.003277 32.202561 8.0976562 32.580078 C 8.1920352 32.957595 8.4308563 33.189581 8.6445312 33.332031 C 10.011254 34.24318 10.252795 36.046511 11.109375 37.650391 C 11.909298 39.244315 13.635662 40 15.400391 40 L 18 40 L 18 44.802734 C 10.967811 42.320535 5.6646795 36.204613 4.3320312 28.703125 C 5.8629338 28.414776 8.4265387 28.068108 11.912109 28.019531 z M 37.882812 28.027344 C 41.445538 28.05784 44.08105 28.404061 45.669922 28.697266 C 44.339047 36.201504 39.034072 42.31987 32 44.802734 L 32 39.599609 C 32 38.015041 31.479642 36.267712 30.574219 34.810547 C 30.299322 34.368135 29.975945 33.949736 29.615234 33.574219 C 31.930453 33.11684 33.832364 32.298821 35.3125 31.154297 C 36.436824 30.284907 37.287588 29.220424 37.882812 28.027344 z M 23.699219 34.099609 L 26.5 34.099609 C 27.312821 34.099609 28.180423 34.7474 28.875 35.865234 C 29.569577 36.983069 30 38.484177 30 39.599609 L 30 45.398438 C 28.397408 45.789234 26.72379 46 25 46 C 23.27621 46 21.602592 45.789234 20 45.398438 L 20 39.599609 C 20 38.508869 20.467828 37.011307 21.208984 35.888672 C 21.950141 34.766037 22.886398 34.099609 23.699219 34.099609 z M 12.308594 35.28125 C 13.174368 36.179258 14.222525 37 15.800781 37 C 16.579948 37 17.552484 37.028073 18.476562 36.945312 C 18.479848 36.945018 18.483042 36.943654 18.486328 36.943359 C 18.36458 37.293361 18.273744 37.645529 18.197266 38 L 15.400391 38 C 14.167057 38 13.29577 37.55443 12.894531 36.751953 L 12.886719 36.738281 L 12.880859 36.726562 C 12.716457 36.421191 12.500645 35.81059 12.308594 35.28125 z"></path>
                  </svg>
                </span>
                <span className="text-white font-semibold text-lg">GitHub</span>
              </a>
              <a href="https://discord.gg/zDnFfbuJVN" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 bg-[#17153b] hover:bg-[#2e236c] rounded-lg p-3 shadow hover:shadow-lg transition">
                {/* Discord SVG */}
                <span className="w-8 h-8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="32" height="32" viewBox="0 0 50 50" style={{ fill: '#FFFFFF' }}>
                    <path d="M 18.90625 7 C 18.90625 7 12.539063 7.4375 8.375 10.78125 C 8.355469 10.789063 8.332031 10.800781 8.3125 10.8125 C 7.589844 11.480469 7.046875 12.515625 6.375 14 C 5.703125 15.484375 4.992188 17.394531 4.34375 19.53125 C 3.050781 23.808594 2 29.058594 2 34 C 1.996094 34.175781 2.039063 34.347656 2.125 34.5 C 3.585938 37.066406 6.273438 38.617188 8.78125 39.59375 C 11.289063 40.570313 13.605469 40.960938 14.78125 41 C 15.113281 41.011719 15.429688 40.859375 15.625 40.59375 L 18.0625 37.21875 C 20.027344 37.683594 22.332031 38 25 38 C 27.667969 38 29.972656 37.683594 31.9375 37.21875 L 34.375 40.59375 C 34.570313 40.859375 34.886719 41.011719 35.21875 41 C 36.394531 40.960938 38.710938 40.570313 41.21875 39.59375 C 43.726563 38.617188 46.414063 37.066406 47.875 34.5 C 47.960938 34.347656 48.003906 34.175781 48 34 C 48 29.058594 46.949219 23.808594 45.65625 19.53125 C 45.007813 17.394531 44.296875 15.484375 43.625 14 C 42.953125 12.515625 42.410156 11.480469 41.6875 10.8125 C 41.667969 10.800781 41.644531 10.789063 41.625 10.78125 C 37.460938 7.4375 31.09375 7 31.09375 7 C 31.019531 6.992188 30.949219 6.992188 30.875 7 C 30.527344 7.046875 30.234375 7.273438 30.09375 7.59375 C 30.09375 7.59375 29.753906 8.339844 29.53125 9.40625 C 27.582031 9.09375 25.941406 9 25 9 C 24.058594 9 22.417969 9.09375 20.46875 9.40625 C 20.246094 8.339844 19.90625 7.59375 19.90625 7.59375 C 19.734375 7.203125 19.332031 6.964844 18.90625 7 Z M 18.28125 9.15625 C 18.355469 9.359375 18.40625 9.550781 18.46875 9.78125 C 16.214844 10.304688 13.746094 11.160156 11.4375 12.59375 C 11.074219 12.746094 10.835938 13.097656 10.824219 13.492188 C 10.816406 13.882813 11.039063 14.246094 11.390625 14.417969 C 11.746094 14.585938 12.167969 14.535156 12.46875 14.28125 C 17.101563 11.410156 22.996094 11 25 11 C 27.003906 11 32.898438 11.410156 37.53125 14.28125 C 37.832031 14.535156 38.253906 14.585938 38.609375 14.417969 C 38.960938 14.246094 39.183594 13.882813 39.175781 13.492188 C 39.164063 13.097656 38.925781 12.746094 38.5625 12.59375 C 36.253906 11.160156 33.785156 10.304688 31.53125 9.78125 C 31.59375 9.550781 31.644531 9.359375 31.71875 9.15625 C 32.859375 9.296875 37.292969 9.894531 40.3125 12.28125 C 40.507813 12.460938 41.1875 13.460938 41.8125 14.84375 C 42.4375 16.226563 43.09375 18.027344 43.71875 20.09375 C 44.9375 24.125 45.921875 29.097656 45.96875 33.65625 C 44.832031 35.496094 42.699219 36.863281 40.5 37.71875 C 38.5 38.496094 36.632813 38.84375 35.65625 38.9375 L 33.96875 36.65625 C 34.828125 36.378906 35.601563 36.078125 36.28125 35.78125 C 38.804688 34.671875 40.15625 33.5 40.15625 33.5 C 40.570313 33.128906 40.605469 32.492188 40.234375 32.078125 C 39.863281 31.664063 39.226563 31.628906 38.8125 32 C 38.8125 32 37.765625 32.957031 35.46875 33.96875 C 34.625 34.339844 33.601563 34.707031 32.4375 35.03125 C 32.167969 35 31.898438 35.078125 31.6875 35.25 C 29.824219 35.703125 27.609375 36 25 36 C 22.371094 36 20.152344 35.675781 18.28125 35.21875 C 18.070313 35.078125 17.8125 35.019531 17.5625 35.0625 C 16.394531 34.738281 15.378906 34.339844 14.53125 33.96875 C 12.234375 32.957031 11.1875 32 11.1875 32 C 10.960938 31.789063 10.648438 31.699219 10.34375 31.75 C 9.957031 31.808594 9.636719 32.085938 9.53125 32.464844 C 9.421875 32.839844 9.546875 33.246094 9.84375 33.5 C 9.84375 33.5 11.195313 34.671875 13.71875 35.78125 C 14.398438 36.078125 15.171875 36.378906 16.03125 36.65625 L 14.34375 38.9375 C 13.367188 38.84375 11.5 38.496094 9.5 37.71875 C 7.300781 36.863281 5.167969 35.496094 4.03125 33.65625 C 4.078125 29.097656 5.0625 24.125 6.28125 20.09375 C 6.90625 18.027344 7.5625 16.226563 8.1875 14.84375 C 8.8125 13.460938 9.492188 12.460938 9.6875 12.28125 C 12.707031 9.894531 17.140625 9.296875 18.28125 9.15625 Z M 18.5 21 C 15.949219 21 14 23.316406 14 26 C 14 28.683594 15.949219 31 18.5 31 C 21.050781 31 23 28.683594 23 26 C 23 23.316406 21.050781 21 18.5 21 Z M 31.5 21 C 28.949219 21 27 23.316406 27 26 C 27 28.683594 28.949219 31 31.5 31 C 34.050781 31 36 28.683594 36 26 C 36 23.316406 34.050781 21 31.5 21 Z M 18.5 23 C 19.816406 23 21 24.265625 21 26 C 21 27.734375 19.816406 29 18.5 29 C 17.183594 29 16 27.734375 16 26 C 16 24.265625 17.183594 23 18.5 23 Z M 31.5 23 C 32.816406 23 34 24.265625 34 26 C 34 27.734375 32.816406 29 31.5 29 C 30.183594 29 29 27.734375 29 26 C 29 24.265625 30.183594 23 31.5 23 Z"></path>
                  </svg>
                </span>
                <span className="text-white font-semibold text-lg">Discord</span>
              </a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
} 