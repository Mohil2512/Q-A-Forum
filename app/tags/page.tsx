'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiTag, FiMessageSquare, FiTrendingUp, FiSearch } from 'react-icons/fi';
import Header from '@/components/Header';

interface Tag {
  name: string;
  count: number;
  description?: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'count'>('count');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      const data = await response.json();
      setTags(data.tags || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedTags = tags
    .filter(tag => 
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return b.count - a.count;
    });

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#f0f6fc] mb-2">Tags</h1>
          <p className="text-[#7d8590]">
            Browse all tags to find topics you're interested in.
          </p>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7d8590] w-4 h-4" />
              <input
                type="text"
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#238636] focus:border-[#238636] text-[#c9d1d9] placeholder-[#7d8590] transition-github"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-[#7d8590]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'count')}
              className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] focus:outline-none focus:ring-2 focus:ring-[#238636] focus:border-[#238636] transition-github"
            >
              <option value="count">Most Used</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 bg-[#21262d] rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-[#21262d] rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedTags.length === 0 ? (
          <div className="card text-center py-12">
            <FiTag className="mx-auto h-12 w-12 text-[#7d8590] mb-4" />
            <h3 className="text-lg font-medium text-[#f0f6fc] mb-2">No tags found</h3>
            <p className="text-[#7d8590]">
              {searchTerm ? 'Try adjusting your search terms.' : 'No tags available yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedTags.map((tag) => (
              <Link
                key={tag.name}
                href={`/questions?tag=${encodeURIComponent(tag.name)}`}
                className="card p-4 hover:shadow-github-lg transition-github group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="tag text-sm group-hover:bg-[#388bfd] transition-github">
                    <FiTag className="w-3 h-3 mr-1" />
                    {tag.name}
                  </div>
                  <div className="flex items-center space-x-1 text-[#7d8590]">
                    <FiMessageSquare className="w-4 h-4" />
                    <span className="text-sm font-medium">{tag.count}</span>
                  </div>
                </div>
                {tag.description && (
                  <p className="text-sm text-[#7d8590] line-clamp-2">
                    {tag.description}
                  </p>
                )}
                <div className="mt-3 pt-3 border-t border-[#30363d]">
                  <div className="flex items-center justify-between text-xs text-[#7d8590]">
                    <span>Questions</span>
                    <span className="font-medium">{tag.count}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 