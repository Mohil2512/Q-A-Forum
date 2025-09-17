'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FiMenu, 
  FiX, 
  FiUser, 
  FiLogOut, 
  FiBell,
  FiPlus,
  FiHome,
  FiTag,
  FiUsers,
  FiMessageSquare
} from 'react-icons/fi';
import NotificationDropdown from './NotificationDropdown';
import UniversalSearch from './UniversalSearch';
import toast from 'react-hot-toast';

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Toggle profile dropdown
  const handleProfileToggle = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/questions?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const getUserAvatar = (user: any) => {
    if (user?.avatar) {
      return (
        <img 
          src={user.avatar} 
          alt={user.displayName || user.username || 'User'}
          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
        <span className="text-xs sm:text-sm font-semibold text-white">
          {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
        </span>
      </div>
    );
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
    <header className={`sticky top-0 w-full border-b border-[#2e236c] shadow-lg z-50 transition-all duration-300 ${scrolled ? 'bg-black/95' : 'bg-black/90'} backdrop-blur-xl`}>
      <div className="container-responsive">
        <div className="flex items-center justify-between py-3 sm:py-4">
          {/* Mobile Menu Button */}
          <button 
            className="sm:hidden p-2 text-gray-300 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center">
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">S</span>
            </span>
            <span className="text-lg sm:text-xl lg:text-2xl font-bold gradient-text hidden xs:block">StackIt</span>
          </Link>

          {/* Desktop Search Bar - Hidden on mobile */}
          <div className="hidden md:block flex-1 max-w-md mx-4 lg:mx-8">
            <UniversalSearch 
              searchQuery={searchQuery}
              onSearchSubmit={handleSearchSubmit}
              onSearchQueryChange={setSearchQuery}
              placeholder="Search users, questions, tags..."
            />
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            <Link href="/questions" className="text-sm xl:text-base font-medium text-[#c8acd6] hover:text-[#58a6ff] transition-colors whitespace-nowrap">Questions</Link>
            <Link href="/tags" className="text-sm xl:text-base font-medium text-[#c8acd6] hover:text-[#58a6ff] transition-colors whitespace-nowrap">Tags</Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {session ? (
              <>
                {/* Notifications - Hidden on small screens */}
                <div className="hidden sm:block">
                  <NotificationDropdown />
                </div>
                
                {/* Ask Question Button */}
                <Link 
                  href="/questions/ask" 
                  className="btn btn-primary px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
                >
                  <FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Ask</span>
                </Link>

                {/* User Profile Dropdown */}
                <div className="relative" ref={profileDropdownRef}>
                  <button 
                    onClick={handleProfileToggle}
                    className="flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-300 border border-white/10"
                  >
                    {getUserAvatar(session.user)}
                    <span className="text-gray-200 font-medium hidden md:block text-sm lg:text-base">
                      {session.user?.displayName || session.user?.username || session.user?.email?.split('@')[0] || 'User'}
                    </span>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-[#1a1625]/95 backdrop-blur-sm border border-white/10 rounded-xl shadow-xl py-2 z-50">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-medium text-gray-200 truncate">
                          {session.user?.displayName || session.user?.username || 'User'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400 truncate">
                          {session.user?.email}
                        </p>
                      </div>
                      
                      <Link 
                        href="/profile" 
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-white/5 transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <FiUser className="w-4 h-4" />
                        Profile
                      </Link>

                      <Link 
                        href="/follow-requests" 
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-white/5 transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <FiUsers className="w-4 h-4" />
                        Follow Requests
                      </Link>
                      
                      {/* Mobile-only notification link */}
                      <div className="sm:hidden">
                        <Link 
                          href="#notifications"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-white/5 transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <FiBell className="w-4 h-4" />
                          Notifications
                        </Link>
                      </div>
                      
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors w-full text-left"
                      >
                        <FiLogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link href="/auth/signin" className="btn btn-outline px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm">Sign In</Link>
                <Link href="/auth/signup" className="btn btn-primary px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm">Sign Up</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <UniversalSearch 
            searchQuery={searchQuery}
            onSearchSubmit={handleSearchSubmit}
            onSearchQueryChange={setSearchQuery}
            placeholder="Search users, questions, tags..."
          />
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-black/90 backdrop-blur-sm border-t border-white/10 py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="flex items-center gap-3 px-4 py-2 text-gray-200 hover:bg-white/5 rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiHome className="w-5 h-5" />
                Home
              </Link>
              <Link 
                href="/questions" 
                className="flex items-center gap-3 px-4 py-2 text-gray-200 hover:bg-white/5 rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiMessageSquare className="w-5 h-5" />
                Questions
              </Link>
              <Link 
                href="/tags" 
                className="flex items-center gap-3 px-4 py-2 text-gray-200 hover:bg-white/5 rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiTag className="w-5 h-5" />
                Tags
              </Link>
              {session?.user?.role === 'admin' && (
                <Link 
                  href="/admin-panel" 
                  className="flex items-center gap-3 px-4 py-2 text-gray-200 hover:bg-white/5 rounded-xl transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiUsers className="w-5 h-5" />
                  Admin Panel
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 