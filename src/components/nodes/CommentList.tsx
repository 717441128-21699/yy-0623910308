import { useState } from 'react';
import { ThumbsUp, MessageCircle, Filter } from 'lucide-react';
import type { Comment, SentimentType } from '@/types';
import { Card } from '@/components/Card';
import { cn } from '@/lib/utils';

interface CommentListProps {
  comments: Comment[];
  nodeTitle: string;
}

type FilterType = 'all' | SentimentType;

const sentimentConfig = {
  positive: { label: '正面', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/30' },
  neutral: { label: '中性', color: 'text-slate-400', bgColor: 'bg-slate-500/10 border-slate-500/30' },
  negative: { label: '负面', color: 'text-rose-400', bgColor: 'bg-rose-500/10 border-rose-500/30' },
};

export function CommentList({ comments, nodeTitle }: CommentListProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredComments = filter === 'all'
    ? comments
    : comments.filter((c) => c.sentiment === filter);

  const counts = {
    all: comments.length,
    positive: comments.filter((c) => c.sentiment === 'positive').length,
    neutral: comments.filter((c) => c.sentiment === 'neutral').length,
    negative: comments.filter((c) => c.sentiment === 'negative').length,
  };

  return (
    <Card className="h-full flex flex-col">
      <Card.Header>
        <div className="flex items-center gap-2">
          <MessageCircle size={16} className="text-slate-400" />
          <Card.Title>典型评论摘要</Card.Title>
        </div>
        <span className="text-xs text-slate-500">{comments.length} 条精选</span>
      </Card.Header>

      <div className="flex gap-1 mb-4">
        {(['all', 'positive', 'neutral', 'negative'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              filter === f
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            )}
          >
            {f === 'all' ? '全部' : sentimentConfig[f].label}
            <span className="ml-1 text-slate-500">({counts[f]})</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 -mr-2 pr-2">
        {filteredComments.map((comment) => {
          const sentiment = sentimentConfig[comment.sentiment];
          return (
            <div
              key={comment.id}
              className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded border flex-shrink-0',
                  sentiment.bgColor,
                  sentiment.color
                )}>
                  {sentiment.label}
                </span>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{comment.source}</span>
                  <span>·</span>
                  <span>{new Date(comment.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed mb-3">
                {comment.content}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <ThumbsUp size={12} />
                  <span>{comment.likes}</span>
                </div>
              </div>
            </div>
          );
        })}
        {filteredComments.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            暂无{filter === 'all' ? '' : sentimentConfig[filter].label}评论
          </div>
        )}
      </div>
    </Card>
  );
}
