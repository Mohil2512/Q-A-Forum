'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  FiUser, 
  FiHelpCircle, 
  FiTag,
  FiSearch,
  FiUsers,
  FiMessageSquare,
  FiHash
} from 'react-icons/fi';

interface SearchUser {
  _id: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
}

interface SearchQuestion {
  _id: string;
  title: string;
  slug: string;
  author: {
    _id: string;
    username: string;
    displayName?: string;
    avatar?: string;
  } | null;
  tags: Array<{
    _id: string;
    name: string;
  }>;
  votes: number;
  createdAt: string;
}

interface SearchTag {
  _id: string;
  name: string;
  description?: string;
  questionsCount: number;
}

interface SearchResults {
  users: SearchUser[];
  questions: SearchQuestion[];
  tags: SearchTag[];
}

interface UniversalSearchProps {
  searchQuery: string;
  onSearchSubmit: (e: React.FormEvent) => void;
  onSearchQueryChange: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function UniversalSearch({ 
  searchQuery, 
  onSearchSubmit, 
  onSearchQueryChange,
  placeholder = "Search users, questions, tags...",
  className = ""
}: UniversalSearchProps) {
  const [searchResults, setSearchResults] = useState<SearchResults>({
    users: [],
    questions: [],
    tags: []
  });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        performSearch();
      } else {
        setSearchResults({
          users: [],
          questions: [],
          tags: []
        });
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = () => {
    setShowSearchResults(false);
    onSearchQueryChange('');
  };

  const getUserAvatar = (user: SearchUser) => {
    if (user.avatar) {
      return (
        <img 
          src={user.avatar} 
          alt={user.displayName || user.username}
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
        <span className="text-xs font-semibold text-white">
          {(user.displayName || user.username)[0]?.toUpperCase()}
        </span>
      </div>
    );
  };

  const hasResults = searchResults.users.length > 0 || searchResults.questions.length > 0 || searchResults.tags.length > 0;

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={onSearchSubmit} className="w-full">
        <div className="relative">
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-100 placeholder-gray-400 transition-all duration-300 text-sm sm:text-base"
          />
          <button type="submit" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300">
            <FiSearch className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
            </div>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showSearchResults && searchQuery.trim().length > 1 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1625]/95 backdrop-blur-sm border border-white/10 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent mx-auto mb-2"></div>
              Searching...
            </div>
          ) : hasResults ? (
            <div className="py-2">
              {/* Users Section */}
              {searchResults.users.length > 0 && (
                <div className="mb-4">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-white/10 flex items-center gap-2">
                    <FiUsers className="w-3 h-3" />
                    Users
                  </div>
                  {searchResults.users.map((user) => (
                    <Link
                      key={user._id}
                      href={`/users/${user.username}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                    >
                      {getUserAvatar(user)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">
                          {user.displayName || user.username}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          @{user.username}
                        </p>
                        {user.bio && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {user.bio}
                          </p>
                        )}
                      </div>
                      <FiUser className="w-4 h-4 text-gray-500" />
                    </Link>
                  ))}
                </div>
              )}

              {/* Questions Section */}
              {searchResults.questions.length > 0 && (
                <div className="mb-4">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-white/10 flex items-center gap-2">
                    <FiMessageSquare className="w-3 h-3" />
                    Questions
                  </div>
                  {searchResults.questions.map((question) => (
                    <Link
                      key={question._id}
                      href={`/questions/${question.slug}`}
                      onClick={handleResultClick}
                      className="block px-4 py-3 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <FiHelpCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-200 truncate">
                            {question.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {question.author && (
                              <span className="text-xs text-gray-400">
                                by @{question.author.username}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {question.votes} votes
                            </span>
                          </div>
                          {question.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {question.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag._id}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                >
                                  {tag.name}
                                </span>
                              ))}
                              {question.tags.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{question.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Tags Section */}
              {searchResults.tags.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-white/10 flex items-center gap-2">
                    <FiHash className="w-3 h-3" />
                    Tags
                  </div>
                  {searchResults.tags.map((tag) => (
                    <Link
                      key={tag._id}
                      href={`/questions?tag=${encodeURIComponent(tag.name)}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                        <FiTag className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">
                          #{tag.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {tag.questionsCount} questions
                        </p>
                        {tag.description && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {tag.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* View All Results */}
              <div className="border-t border-white/10 mt-2">
                <button
                  onClick={() => {
                    onSearchSubmit({ preventDefault: () => {} } as React.FormEvent);
                    handleResultClick();
                  }}
                  className="w-full px-4 py-3 text-sm text-purple-400 hover:bg-white/5 transition-colors text-center"
                >
                  View all results for "{searchQuery}"
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400">
              No results found for "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
