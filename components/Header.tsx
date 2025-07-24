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
    <header className={`sticky top-0 w-full border-b border-[#2e236c] shadow-lg z-50 transition-all duration-300 ${scrolled ? 'bg-black/60' : 'bg-black/80'}`}>
      <div className="container-responsive flex items-center justify-between gap-4 py-3 px-2 mx-auto">
          {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <span className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl w-12 h-12 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">S</span>
          </span>
          <span className="text-2xl font-bold gradient-text ml-2">StackIt</span>
        </Link>
          {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-100 placeholder-gray-400 transition-all duration-300"
            />
            <button type="submit" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
            </button>
              </div>
          </form>
        {/* Navigation */}
        <nav className="flex items-center gap-8">
          <Link href="/questions" className="text-lg font-medium text-[#c8acd6] hover:text-[#58a6ff] transition-colors">Questions</Link>
          <Link href="/tags" className="text-lg font-medium text-[#c8acd6] hover:text-[#58a6ff] transition-colors">Tags</Link>
        </nav>
        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <Link href="/auth/signin" className="btn btn-outline px-5 py-2 text-base">Sign In</Link>
          <Link href="/auth/signup" className="btn btn-primary px-5 py-2 text-base">Sign Up</Link>
        </div>
      </div>
    </header>
  );
} 