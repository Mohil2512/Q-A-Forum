'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FiSearch, 
  FiMenu, 
  FiX, 
  FiUser, 
  FiLogOut, 
  FiSettings,
  FiBell,
  FiPlus,
  FiHome,
  FiTag,
  FiUsers
} from 'react-icons/fi';
import NotificationDropdown from './NotificationDropdown';
import toast from 'react-hot-toast';

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close profile dropdown when notification dropdown opens
  const handleNotificationToggle = () => {
    setIsProfileDropdownOpen(false);
  };

  // Close notification dropdown when profile dropdown opens
  const handleProfileToggle = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

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
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10">
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center glow group-hover:glow-lg transition-all duration-300">
              <FiHome className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">StackIt</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/questions" 
              className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center space-x-2"
            >
              <FiSearch className="w-4 h-4" />
              <span>Questions</span>
            </Link>
            <Link 
              href="/tags" 
              className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center space-x-2"
            >
              <FiTag className="w-4 h-4" />
              <span>Tags</span>
            </Link>
            {session && (
              <Link 
                href="/questions/ask" 
                className="btn btn-primary text-sm px-6 py-2 whitespace-nowrap"
              >
                <FiPlus className="w-4 h-4 mr-1 inline" />
                Ask Question
              </Link>
            )}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8 relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-100 placeholder-gray-400 transition-all duration-300"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                </div>
              )}
            </form>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden">
                {searchResults.map((question: any) => (
                  <Link
                    key={question._id}
                    href={`/questions/${question._id}`}
                    className="block px-4 py-3 hover:bg-white/5 transition-colors duration-200 border-b border-white/5 last:border-b-0"
                    onClick={() => {
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }}
                  >
                    <div className="text-gray-100 font-medium line-clamp-1">{question.title}</div>
                    <div className="text-gray-400 text-sm line-clamp-1">{question.shortDescription}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <NotificationDropdown onClose={handleNotificationToggle} />
                
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={handleProfileToggle}
                    className="flex items-center space-x-2 p-2 rounded-xl hover:bg-white/5 transition-colors duration-300"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-300 hidden lg:block">{session.user?.username}</span>
                  </button>

                  {/* User Dropdown */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50">
                      <div className="py-2">
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-gray-300 hover:bg-white/5 transition-colors duration-200"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <FiUser className="w-4 h-4 mr-3" />
                          Profile
                        </Link>
                        {session.user?.role === 'admin' && (
                          <Link
                            href="/admin-panel"
                            className="flex items-center px-4 py-2 text-gray-300 hover:bg-white/5 transition-colors duration-200"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <FiSettings className="w-4 h-4 mr-3" />
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-white/5 transition-colors duration-200"
                        >
                          <FiLogOut className="w-4 h-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/signin" className="btn btn-outline text-sm">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-white/5 transition-colors duration-300"
            >
              {isMenuOpen ? (
                <FiX className="w-6 h-6 text-gray-300" />
              ) : (
                <FiMenu className="w-6 h-6 text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden py-4 border-t border-white/10">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-100 placeholder-gray-400 transition-all duration-300"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
              </div>
            )}
          </form>

          {/* Mobile Search Results */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden">
              {searchResults.map((question: any) => (
                <Link
                  key={question._id}
                  href={`/questions/${question._id}`}
                  className="block px-4 py-3 hover:bg-white/5 transition-colors duration-200 border-b border-white/5 last:border-b-0"
                  onClick={() => {
                    setShowSearchResults(false);
                    setSearchQuery('');
                  }}
                >
                  <div className="text-gray-100 font-medium line-clamp-1">{question.title}</div>
                  <div className="text-gray-400 text-sm line-clamp-1">{question.shortDescription}</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <nav className="space-y-2">
              <Link
                href="/questions"
                className="flex items-center px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiSearch className="w-4 h-4 mr-3" />
                Questions
              </Link>
              <Link
                href="/tags"
                className="flex items-center px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiTag className="w-4 h-4 mr-3" />
                Tags
              </Link>
              {session && (
                <Link
                  href="/questions/ask"
                  className="flex items-center px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiPlus className="w-4 h-4 mr-3" />
                  Ask Question
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 