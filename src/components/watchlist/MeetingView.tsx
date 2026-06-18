import { useState } from 'react';
import { Clock, User, AlertTriangle, CheckCircle, Copy, Check, GitBranch, MessageSquare, Users, Calendar, ChevronDown } from 'lucide-react';
import type { WatchItem, Priority, WatchStatus, SourceType, ActionRecord } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  high: { label: '高', color: 'text-rose-400' },
  medium: { label: '中', color: 'text-amber-400' },
  low: { label: '低', color: 'text-emerald-400' },
};

const statusConfig: Record<WatchStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: '待处理', color: 'text-slate-400', icon: Clock },
  watching: { label: '观察中', color: 'text-blue-400', icon: Clock },
  resolved: { label: '已解决', color: 'text-emerald-400', icon: CheckCircle },
  escalated: { label: '需升级', color: 'text-rose-400', icon: AlertTriangle },
};

const sourceTypeConfig: Record<SourceType, { label: string; icon: typeof GitBranch }> = {
  node: { label: '版本节点', icon: GitBranch },
  controversy: { label: '社区争议', icon: MessageSquare },
  manual: { label: '手动添加', icon: Clock },
};

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

interface MeetingGroup {
  title: string;
  items: WatchItem[];
  color: string;
  dotColor: string;
}

function groupForMeeting(items: WatchItem[]): MeetingGroup[] {
  const active = items.filter((i) => i.status !== 'resolved');

  const overdue = active.filter((i) => getDaysUntil(i.nextReviewDate) < 0);
  const urgent = active.filter((i) => {
    const d = getDaysUntil(i.nextReviewDate);
    return d >= 0 && d <= 2;
  });
  const highPriority = active.filter((i) => i.priority === 'high' && !overdue.includes(i) && !urgent.includes(i));
  const escalated = active.filter((i) => i.status === 'escalated' && !overdue.includes(i) && !urgent.includes(i) && !highPriority.includes(i));
  const watching = active.filter((i) => !overdue.includes(i) && !urgent.includes(i) && !highPriority.includes(i) && !escalated.includes(i));
  const resolved = items.filter((i) => i.status === 'resolved');

  const groups: MeetingGroup[] = [];

  if (overdue.length > 0) {
    groups.push({ title: '已逾期', items: overdue, color: 'text-rose-400', dotColor: 'bg-rose-400' });
  }
  if (urgent.length > 0) {
    groups.push({ title: '即将到期', items: urgent, color: 'text-amber-400', dotColor: 'bg-amber-400' });
  }
  if (escalated.length > 0) {
    groups.push({ title: '需升级处理', items: escalated, color: 'text-rose-400', dotColor: 'bg-rose-400' });
  }
  if (highPriority.length > 0) {
    groups.push({ title: '高优先级', items: highPriority, color: 'text-rose-400', dotColor: 'bg-rose-400' });
  }
  if (watching.length > 0) {
    groups.push({ title: '持续观察', items: watching, color: 'text-blue-400', dotColor: 'bg-blue-400' });
  }
  if (resolved.length > 0) {
    groups.push({ title: '已解决', items: resolved, color: 'text-emerald-400', dotColor: 'bg-emerald-400' });
  }

  return groups;
}

function groupByAssignee(items: WatchItem[]): { assignee: string; items: WatchItem[] }[] {
  const map = new Map<string, WatchItem[]>();
  items.forEach((item) => {
    const key = item.assignee || '未指定';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  });
  return Array.from(map.entries())
    .map(([assignee, items]) => ({ assignee, items }))
    .sort((a, b) => b.items.length - a.items.length);
}

function groupByReviewDate(items: WatchItem[]): { week: string; items: WatchItem[] }[] {
  const map = new Map<string, WatchItem[]>();
  items.forEach((item) => {
    const date = new Date(item.nextReviewDate);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const key = weekStart.toISOString().split('T')[0];
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, items]) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const fmt = (d: string) => new Date(d).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
      return { week: `${fmt(weekStart)} ~ ${fmt(weekEnd.toISOString().split('T')[0])}`, items };
    });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

type ExportMode = 'urgency' | 'assignee' | 'reviewDate';

function generateMeetingMinutes(items: WatchItem[], mode: ExportMode): string {
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  let text = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `       口碑观察例会纪要\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `日期：${today}\n`;

  if (mode === 'assignee') {
    text += `分组方式：按负责人\n`;
  } else if (mode === 'reviewDate') {
    text += `分组方式：按下次查看时间\n`;
  } else {
    text += `分组方式：按紧急程度\n`;
  }
  text += '\n';

  let totalActions = 0;
  let totalResolved = 0;

  const formatItem = (item: WatchItem, idx: number): string => {
    const days = getDaysUntil(item.nextReviewDate);
    const timeStr = days < 0 ? `逾期${Math.abs(days)}天` : days === 0 ? '今天到期' : `${days}天后到期`;
    let s = `${idx + 1}. ${item.title}\n`;
    s += `   ├─ 状态：${statusConfig[item.status].label} | 优先级：${priorityConfig[item.priority].label}\n`;
    s += `   ├─ 来源：${sourceTypeConfig[item.sourceType].label}「${item.sourceTitle || item.title}」\n`;
    if (item.relatedNodeId) {
      s += `   ├─ 关联：节点 #${item.relatedNodeId}\n`;
    }
    if (item.relatedControversyId) {
      s += `   ├─ 关联：争议 #${item.relatedControversyId}\n`;
    }
    s += `   ├─ 责任人：${item.assignee || '未指定'} | 下次查看：${formatDate(item.nextReviewDate)}（${timeStr}）\n`;
    if (item.lastAction) {
      const actionDate = item.lastActionDate ? `（${formatDate(item.lastActionDate)}）` : '';
      s += `   ├─ 最近动作${actionDate}：${item.lastAction}\n`;
    }
    if (item.nextStep && item.status !== 'resolved') {
      s += `   ├─ 下一步：${item.nextStep}\n`;
    }
    if (item.description) {
      s += `   └─ 背景：${item.description}\n`;
    }
    if (item.status !== 'resolved') totalActions++;
    else totalResolved++;
    return s + '\n';
  };

  if (mode === 'assignee') {
    const groups = groupByAssignee(items);
    groups.forEach((group) => {
      text += `【${group.assignee}】（${group.items.length} 项）─────────────────\n`;
      group.items.forEach((item, idx) => {
        text += formatItem(item, idx);
      });
      text += '\n';
    });
  } else if (mode === 'reviewDate') {
    const groups = groupByReviewDate(items);
    groups.forEach((group) => {
      text += `【${group.week}】（${group.items.length} 项）─────────────────\n`;
      group.items.forEach((item, idx) => {
        text += formatItem(item, idx);
      });
      text += '\n';
    });
  } else {
    const groups = groupForMeeting(items);
    groups.forEach((group) => {
      if (group.items.length === 0) return;
      text += `【${group.title}】─────────────────────────\n`;
      group.items.forEach((item, idx) => {
        text += formatItem(item, idx);
      });
      text += '\n';
    });
  }

  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `📊 会议总结\n`;
  text += `  • 待跟进事项：${totalActions} 项\n`;
  text += `  • 已解决事项：${totalResolved} 项\n`;

  if (mode === 'assignee') {
    const groups = groupByAssignee(items.filter((i) => i.status !== 'resolved'));
    groups.forEach((g) => {
      text += `  • ${g.assignee}：${g.items.length} 项待跟进\n`;
    });
  }

  text += `  • 下次会议：${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN')}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

  return text;
}

export function MeetingView() {
  const watchItems = useAppStore((state) => state.watchItems);
  const [copied, setCopied] = useState(false);
  const [exportMode, setExportMode] = useState<ExportMode>('urgency');
  const [showModeMenu, setShowModeMenu] = useState(false);

  const groups = groupForMeeting(watchItems);

  const handleExport = (mode: ExportMode) => {
    const text = generateMeetingMinutes(watchItems, mode);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setShowModeMenu(false);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setShowModeMenu(false);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const exportModeLabels: Record<ExportMode, string> = {
    urgency: '按紧急程度',
    assignee: '按负责人',
    reviewDate: '按查看时间',
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">例会视图</h3>
          <p className="text-sm text-slate-400 mt-0.5">按紧急程度分组，适合例会逐项过</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowModeMenu(!showModeMenu)}
              className="px-3 py-2 text-sm text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {exportMode === 'assignee' ? <Users size={14} /> :
               exportMode === 'reviewDate' ? <Calendar size={14} /> :
               <Copy size={14} />}
              {exportModeLabels[exportMode]}
              <ChevronDown size={12} className="text-slate-500" />
            </button>
            {showModeMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowModeMenu(false)} />
                <div className="absolute right-0 top-10 z-20 w-44 bg-slate-700 border border-slate-600/50 rounded-lg shadow-xl py-1">
                  {([
                    { mode: 'urgency' as const, label: '按紧急程度', icon: AlertTriangle },
                    { mode: 'assignee' as const, label: '按负责人分发', icon: Users },
                    { mode: 'reviewDate' as const, label: '按查看时间', icon: Calendar },
                  ]).map((opt) => (
                    <button
                      key={opt.mode}
                      onClick={() => { setExportMode(opt.mode); setShowModeMenu(false); }}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors',
                        exportMode === opt.mode ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300 hover:bg-slate-600/50'
                      )}
                    >
                      <opt.icon size={12} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => handleExport(exportMode)}
            className={cn(
              'px-4 py-2 text-sm rounded-lg transition-all flex items-center gap-2',
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            )}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? '已复制' : '复制会议纪要'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.title}>
            <div className="flex items-center gap-2 mb-3">
              <span className={cn('w-2 h-2 rounded-full', group.dotColor)} />
              <h4 className={cn('text-sm font-semibold', group.color)}>{group.title}</h4>
              <span className="text-xs text-slate-500">({group.items.length})</span>
            </div>
            <div className="space-y-2">
              {group.items.map((item) => {
                const status = statusConfig[item.status];
                const priority = priorityConfig[item.priority];
                const sourceType = sourceTypeConfig[item.sourceType];
                const days = getDaysUntil(item.nextReviewDate);
                const isOverdue = days < 0;
                const isUrgent = days >= 0 && days <= 2;
                const StatusIcon = status.icon;
                const SourceIcon = sourceType.icon;

                return (
                  <div
                    key={item.id}
                    className="bg-slate-800/60 border border-slate-700/40 rounded-lg p-4 hover:border-slate-600/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <StatusIcon size={12} className={status.color} />
                          <span className="text-sm font-medium text-white">{item.title}</span>
                          <span className={cn('text-xs', priority.color)}>
                            [{priority.label}]
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <SourceIcon size={10} />
                            {sourceType.label}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 mb-1.5">
                          <span className="text-slate-500">来源：</span>{item.sourceTitle}
                        </p>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-2">
                          {item.description}
                        </p>

                        {item.lastAction && (
                          <p className="text-xs text-slate-400 mb-1">
                            <span className="text-slate-500">最近动作：</span>{item.lastAction}
                          </p>
                        )}
                        {item.nextStep && item.status !== 'resolved' && (
                          <p className="text-xs text-blue-300">
                            <span className="text-slate-500">下一步：</span>{item.nextStep}
                          </p>
                        )}

                        {item.actionTimeline && item.actionTimeline.length > 1 && (
                          <div className="mt-2 pt-2 border-t border-slate-700/30">
                            <p className="text-[10px] text-slate-500 mb-1">处理轨迹（{item.actionTimeline.length} 步）</p>
                            <div className="flex flex-wrap gap-1">
                              {item.actionTimeline.map((record, idx) => {
                                const dotConfig: Record<WatchStatus, string> = {
                                  pending: 'bg-slate-400',
                                  watching: 'bg-blue-400',
                                  escalated: 'bg-rose-400',
                                  resolved: 'bg-emerald-400',
                                };
                                return (
                                  <span key={idx} className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                                    <span className={cn('w-1.5 h-1.5 rounded-full', dotConfig[record.status])} />
                                    {formatDate(record.date)}
                                    {idx < item.actionTimeline!.length - 1 && <span className="text-slate-600">→</span>}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1.5 mb-1 justify-end">
                          <User size={11} className="text-slate-500" />
                          <span className="text-xs text-slate-300">{item.assignee || '未指定'}</span>
                        </div>
                        <div className={cn(
                          'text-xs',
                          isOverdue ? 'text-rose-400' :
                          isUrgent ? 'text-amber-400' :
                          'text-slate-500'
                        )}>
                          {isOverdue ? `逾期 ${Math.abs(days)} 天` :
                           days === 0 ? '今天到期' :
                           `${days} 天后`}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {formatDate(item.nextReviewDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">
          暂无观察项，请在卡片视图中添加
        </div>
      )}
    </div>
  );
}
