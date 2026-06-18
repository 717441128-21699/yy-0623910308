import type {
  DailyTemperature,
  Controversy,
  VersionNode,
  Comment,
  WatchItem,
  Competitor,
} from '../types';

const today = new Date('2026-06-19');

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function daysAgo(n: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return formatDate(d);
}

function daysFromNow(n: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return formatDate(d);
}

export const dailyTemperatures: DailyTemperature[] = [
  { date: daysAgo(13), score: 75, discussionCount: 9200, positiveRatio: 0.62, neutralRatio: 0.25, negativeRatio: 0.13 },
  { date: daysAgo(12), score: 73, discussionCount: 8900, positiveRatio: 0.60, neutralRatio: 0.26, negativeRatio: 0.14 },
  { date: daysAgo(11), score: 71, discussionCount: 9500, positiveRatio: 0.58, neutralRatio: 0.27, negativeRatio: 0.15 },
  { date: daysAgo(10), score: 74, discussionCount: 10200, positiveRatio: 0.61, neutralRatio: 0.26, negativeRatio: 0.13 },
  { date: daysAgo(9), score: 76, discussionCount: 11500, positiveRatio: 0.63, neutralRatio: 0.25, negativeRatio: 0.12 },
  { date: daysAgo(8), score: 78, discussionCount: 12800, positiveRatio: 0.65, neutralRatio: 0.24, negativeRatio: 0.11 },
  { date: daysAgo(7), score: 65, discussionCount: 15600, positiveRatio: 0.52, neutralRatio: 0.28, negativeRatio: 0.20 },
  { date: daysAgo(6), score: 58, discussionCount: 18900, positiveRatio: 0.45, neutralRatio: 0.30, negativeRatio: 0.25 },
  { date: daysAgo(5), score: 55, discussionCount: 21500, positiveRatio: 0.42, neutralRatio: 0.30, negativeRatio: 0.28 },
  { date: daysAgo(4), score: 60, discussionCount: 19200, positiveRatio: 0.48, neutralRatio: 0.29, negativeRatio: 0.23 },
  { date: daysAgo(3), score: 66, discussionCount: 16800, positiveRatio: 0.54, neutralRatio: 0.27, negativeRatio: 0.19 },
  { date: daysAgo(2), score: 69, discussionCount: 14500, positiveRatio: 0.57, neutralRatio: 0.26, negativeRatio: 0.17 },
  { date: daysAgo(1), score: 71, discussionCount: 13200, positiveRatio: 0.59, neutralRatio: 0.26, negativeRatio: 0.15 },
  { date: daysAgo(0), score: 72, discussionCount: 12847, positiveRatio: 0.58, neutralRatio: 0.27, negativeRatio: 0.15 },
];

export const controversies: Controversy[] = [
  {
    id: 'c-001',
    title: '新英雄平衡争议',
    sentiment: 'negative',
    heat: 2840,
    relatedNodeId: 'node-001',
    summary: '玩家认为新英雄爆发过高，上路生态失衡，胜率数据偏高',
    trend: 'falling',
  },
  {
    id: 'c-002',
    title: '赛季奖励缩水吐槽',
    sentiment: 'negative',
    heat: 1920,
    relatedNodeId: 'node-002',
    summary: '玩家对比上赛季奖励，认为本赛季皮肤质量下降、数量减少',
    trend: 'stable',
  },
  {
    id: 'c-003',
    title: '匹配机制公平性质疑',
    sentiment: 'negative',
    heat: 1650,
    summary: '连胜后必连败的体感强烈，ELO 机制被广泛讨论',
    trend: 'rising',
  },
  {
    id: 'c-004',
    title: '68元礼包好评',
    sentiment: 'positive',
    heat: 1420,
    relatedNodeId: 'node-003',
    summary: '玩家普遍认为新出的战令礼包性价比高，皮肤质量上乘',
    trend: 'stable',
  },
  {
    id: 'c-005',
    title: '卡顿问题反馈',
    sentiment: 'negative',
    heat: 980,
    summary: '部分机型在团战场景出现掉帧，中低端机体验差',
    trend: 'stable',
  },
];

export const versionNodes: VersionNode[] = [
  {
    id: 'node-001',
    type: 'hero',
    date: daysAgo(7),
    title: '新英雄「影刃」上线',
    description: '刺客型英雄，高爆发高机动性，附带伴生皮肤',
    beforeSentiment: 0.68,
    afterSentiment: 0.42,
    peakDiscussion: 21500,
    commentCount: 3420,
  },
  {
    id: 'node-002',
    type: 'season',
    date: daysAgo(14),
    title: 'S12赛季开启',
    description: '新赛季段位重置，赛季通行证上线，排位机制调整',
    beforeSentiment: 0.60,
    afterSentiment: 0.72,
    peakDiscussion: 12800,
    commentCount: 1850,
  },
  {
    id: 'node-003',
    type: 'bundle',
    date: daysAgo(3),
    title: '夏日限定礼包',
    description: '68元包含3款皮肤+头像框+表情，限时两周售卖',
    beforeSentiment: 0.55,
    afterSentiment: 0.66,
    peakDiscussion: 16800,
    commentCount: 2100,
  },
  {
    id: 'node-004',
    type: 'patch',
    date: daysAgo(10),
    title: '版本平衡补丁',
    description: '5个英雄调整，装备系统小幅优化',
    beforeSentiment: 0.63,
    afterSentiment: 0.58,
    peakDiscussion: 10200,
    commentCount: 1280,
  },
  {
    id: 'node-005',
    type: 'skin',
    date: daysAgo(5),
    title: '传说皮肤「星陨」',
    description: '高品质传说皮肤，自带专属回城和击杀特效',
    beforeSentiment: 0.60,
    afterSentiment: 0.55,
    peakDiscussion: 18900,
    commentCount: 2680,
  },
];

export const nodeComments: Record<string, Comment[]> = {
  'node-001': [
    { id: 'cm-001', nodeId: 'node-001', content: '这英雄伤害也太离谱了吧？一套秒肉？还能不能玩了？', sentiment: 'negative', likes: 234, date: daysAgo(5), source: '贴吧' },
    { id: 'cm-002', nodeId: 'node-001', content: '刚练了两把，确实强，但是操作门槛也高，不算太超模', sentiment: 'neutral', likes: 89, date: daysAgo(5), source: 'NGA' },
    { id: 'cm-003', nodeId: 'node-001', content: '帅是真的帅，强度什么的慢慢来，先买为敬', sentiment: 'positive', likes: 156, date: daysAgo(6), source: 'B站' },
    { id: 'cm-004', nodeId: 'node-001', content: '策划能不能用脚做平衡？上单玩家直接退游', sentiment: 'negative', likes: 178, date: daysAgo(5), source: '微博' },
    { id: 'cm-005', nodeId: 'node-001', content: '等下周热修补丁吧，新英雄刚出都这样', sentiment: 'neutral', likes: 67, date: daysAgo(4), source: '贴吧' },
    { id: 'cm-006', nodeId: 'node-001', content: '伴生皮肤质量不错，比上几个英雄的强多了', sentiment: 'positive', likes: 98, date: daysAgo(6), source: 'TapTap' },
  ],
  'node-002': [
    { id: 'cm-007', nodeId: 'node-002', content: '终于开新赛季了！上赛季打吐了', sentiment: 'positive', likes: 312, date: daysAgo(13), source: '贴吧' },
    { id: 'cm-008', nodeId: 'node-002', content: '赛季奖励就这？去年还有限定皮肤呢', sentiment: 'negative', likes: 245, date: daysAgo(13), source: '微博' },
    { id: 'cm-009', nodeId: 'node-002', content: '排位机制改了吗？还是熟悉的ELO味道', sentiment: 'neutral', likes: 78, date: daysAgo(12), source: 'NGA' },
  ],
  'node-003': [
    { id: 'cm-010', nodeId: 'node-003', content: '68块3个皮肤？这波是良心发现？', sentiment: 'positive', likes: 456, date: daysAgo(2), source: 'B站' },
    { id: 'cm-011', nodeId: 'node-003', content: '皮肤质量确实可以，已经入手了', sentiment: 'positive', likes: 234, date: daysAgo(2), source: 'TapTap' },
    { id: 'cm-012', nodeId: 'node-003', content: '又来骗氪？不买立省100%', sentiment: 'negative', likes: 56, date: daysAgo(3), source: '贴吧' },
  ],
  'node-004': [
    { id: 'cm-013', nodeId: 'node-004', content: '我本命英雄终于加强了！感动', sentiment: 'positive', likes: 123, date: daysAgo(9), source: '贴吧' },
    { id: 'cm-014', nodeId: 'node-004', content: '砍了我玩的英雄，这游戏没法玩了', sentiment: 'negative', likes: 89, date: daysAgo(9), source: 'NGA' },
  ],
  'node-005': [
    { id: 'cm-015', nodeId: 'node-005', content: '这皮肤也太贵了吧？168？抢钱呢', sentiment: 'negative', likes: 345, date: daysAgo(4), source: '微博' },
    { id: 'cm-016', nodeId: 'node-005', content: '特效炸裂，钱包已经空了', sentiment: 'positive', likes: 198, date: daysAgo(4), source: 'B站' },
    { id: 'cm-017', nodeId: 'node-005', content: '好看是好看，但是原价买有点亏，等打折', sentiment: 'neutral', likes: 145, date: daysAgo(3), source: 'TapTap' },
  ],
};

export const watchItems: WatchItem[] = [
  {
    id: 'w-001',
    title: '新英雄平衡问题',
    description: '新英雄「影刃」上线后负面评价较多，需持续观察热修补丁后的口碑变化',
    sourceUrl: '',
    priority: 'high',
    status: 'watching',
    assignee: '李平衡',
    nextReviewDate: daysFromNow(2),
    createdAt: daysAgo(3),
    notes: '等待下周二热修补丁数据，关注胜率和Ban率变化',
    relatedNodeId: 'node-001',
    sourceType: 'node',
    sourceTitle: '新英雄「影刃」上线',
    lastAction: '观察了上线后7天数据，胜率58%偏高',
    lastActionDate: daysAgo(1),
    nextStep: '等待热修补丁上线后复测',
  },
  {
    id: 'w-002',
    title: '匹配机制吐槽',
    description: '近期关于匹配公平性的负面讨论有上升趋势',
    sourceUrl: '',
    priority: 'high',
    status: 'pending',
    assignee: '王系统',
    nextReviewDate: daysFromNow(5),
    createdAt: daysAgo(7),
    notes: '下版本规划匹配机制优化，目前先收集玩家反馈',
    relatedControversyId: 'c-003',
    sourceType: 'controversy',
    sourceTitle: '匹配机制公平性质疑',
    lastAction: '整理了近30天玩家反馈关键词',
    lastActionDate: daysAgo(2),
    nextStep: '拉算法同学一起评估ELO阈值调整方案',
  },
  {
    id: 'w-003',
    title: '传说皮肤定价反馈',
    description: '168元传说皮肤定价引发部分玩家不满，观察后续销售数据',
    sourceUrl: '',
    priority: 'medium',
    status: 'watching',
    assignee: '张商业化',
    nextReviewDate: daysFromNow(1),
    createdAt: daysAgo(4),
    notes: '首周销量达标，但差评率高于预期，需评估是否调整定价策略',
    relatedNodeId: 'node-005',
    sourceType: 'node',
    sourceTitle: '传说皮肤「星陨」',
    lastAction: '对比了历史3款传说皮肤的首周数据',
    lastActionDate: daysAgo(1),
    nextStep: '观察打折活动期间销量变化',
  },
  {
    id: 'w-004',
    title: '低端机卡顿问题',
    description: '部分中低端机型反馈团战卡顿严重',
    sourceUrl: '',
    priority: 'medium',
    status: 'escalated',
    assignee: '陈技术',
    nextReviewDate: daysFromNow(3),
    createdAt: daysAgo(10),
    notes: '已升级为技术重点问题，预计下版本优化',
    relatedControversyId: 'c-005',
    sourceType: 'controversy',
    sourceTitle: '卡顿问题反馈',
    lastAction: '升级为技术重点问题，成立专项小组',
    lastActionDate: daysAgo(3),
    nextStep: '下周输出性能优化方案',
  },
  {
    id: 'w-005',
    title: '举报系统有效性',
    description: '玩家普遍反馈举报系统形同虚设，外挂和演员问题严重',
    sourceUrl: '',
    priority: 'low',
    status: 'resolved',
    assignee: '赵运营',
    nextReviewDate: daysAgo(2),
    createdAt: daysAgo(20),
    notes: '已上线新的反作弊系统，负面讨论下降40%，观察中',
    sourceType: 'manual',
    sourceTitle: '手动录入',
    lastAction: '新反作弊系统上线，数据验证通过',
    lastActionDate: daysAgo(5),
    nextStep: '闭环，不再跟进',
  },
];

export const competitors: Competitor[] = [
  { name: '王者荣耀', score: 78, discussionCount: 45600, positiveRatio: 0.65 },
  { name: '英雄联盟手游', score: 71, discussionCount: 28900, positiveRatio: 0.58 },
  { name: '决战平安京', score: 74, discussionCount: 12300, positiveRatio: 0.62 },
  { name: '曙光英雄', score: 65, discussionCount: 8500, positiveRatio: 0.52 },
];

export function getTodayTemperature(): DailyTemperature {
  return dailyTemperatures[dailyTemperatures.length - 1];
}

export function getLast7DaysTemperatures(): DailyTemperature[] {
  return dailyTemperatures.slice(-7);
}

export function getNodeComments(nodeId: string): Comment[] {
  return nodeComments[nodeId] || [];
}

export function getNodeById(nodeId: string): VersionNode | undefined {
  return versionNodes.find(n => n.id === nodeId);
}

export function getNodeDailyData(nodeId: string): DailyTemperature[] {
  const node = versionNodes.find(n => n.id === nodeId);
  if (!node) return [];
  const nodeIndex = dailyTemperatures.findIndex(d => d.date === node.date);
  if (nodeIndex === -1) return [];
  const start = Math.max(0, nodeIndex - 3);
  const end = Math.min(dailyTemperatures.length, nodeIndex + 8);
  return dailyTemperatures.slice(start, end);
}
