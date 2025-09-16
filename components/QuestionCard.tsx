'use client';

import Link from 'next/link';
import { FiEye, FiMessageSquare, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

interface Tag {
  name: string;
  description?: string;
}

interface QuestionCardProps {
  question: {
    _id: string;
    title: string;
    content: string;
    author: {
      username: string;
      reputation: number;
    };
    tags: Tag[];
    votes: {
      upvotes: string[];
      downvotes: string[];
    };
    views: number;
    answers: number;
    createdAt: string;
  };
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const voteCount = question.votes.upvotes.length - question.votes.downvotes.length;
  return (
    <div className="rounded-xl border border-[#2e236c] bg-[#181a2a] shadow-md hover:shadow-lg transition-shadow p-3 mb-4 flex flex-col gap-3">
      {/* Title */}
      <Link href={`/questions/${question._id}`}>
        <h3 className="text-2xl font-bold text-[#c8acd6] hover:text-[#58a6ff] transition-colors mb-1 truncate">
          {question.title}
        </h3>
      </Link>
      {/* Description */}
      <p className="text-[#b3b8c5] text-base mb-2 line-clamp-2">
        {question.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
      </p>
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {question.tags.slice(0, 4).map((tag) => (
          <Link
            key={tag.name}
            href={`/tags?tag=${encodeURIComponent(tag.name)}`}
            className="px-3 py-1 rounded-full bg-[#2e236c] text-[#c8acd6] text-xs font-semibold hover:bg-[#433d8b] transition-colors border border-[#322a5c]"
            title={tag.description || tag.name}
          >
            #{tag.name}
          </Link>
        ))}
        {question.tags.length > 4 && (
          <span className="text-[#7d8590] text-xs">+{question.tags.length - 4} more</span>
        )}
      </div>
      {/* Divider */}
      <div className="border-t border-[#282c44] my-2" />
      {/* Bottom Bar: Meta & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-6 w-full justify-between">
          <div className="flex items-center gap-4 flex-wrap text-[#7d8590]">
            <span className="flex items-center gap-1"><span className="font-medium text-[#c8acd6]">👤 {question.author.username}</span></span>
            <span className="flex items-center gap-1">⭐ {question.author.reputation}</span>
            <span><FiEye className="inline w-4 h-4 mr-1" />{question.views} views</span>
            <span><FiMessageSquare className="inline w-4 h-4 mr-1" />{question.answers} answers</span>
            <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
          </div>
          {/* Stats: Upvotes/Downvotes only */}
          <div className="flex items-center gap-3 flex-nowrap">
            <span className="flex items-center gap-1 bg-[#2e236c] text-[#58a6ff] px-2 py-1 rounded-full font-bold">
              <FiThumbsUp className="w-4 h-4" />{question.votes.upvotes.length}
            </span>
            <span className="flex items-center gap-1 bg-[#2e236c] text-[#e57373] px-2 py-1 rounded-full font-bold">
              <FiThumbsDown className="w-4 h-4" />{question.votes.downvotes.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 