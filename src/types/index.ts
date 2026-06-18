export type SentimentType = 'positive' | 'neutral' | 'negative';

export type NodeType = 'hero' | 'skin' | 'season' | 'bundle' | 'patch';

export type WatchStatus = 'watching' | 'resolved' | 'escalated';

export type Priority = 'high' | 'medium' | 'low';

export interface DailyTemperature {
  date: string;
  score: number;
  discussionCount: number;
  positiveRatio: number;
  neutralRatio: number;
  negativeRatio: number;
}

export interface Controversy {
  id: string;
  title: string;
  sentiment: SentimentType;
  heat: number;
  relatedNodeId?: string;
  summary: string;
  trend: 'rising' | 'stable' | 'falling';
}

export interface VersionNode {
  id: string;
  type: NodeType;
  date: string;
  title: string;
  description: string;
  beforeSentiment: number;
  afterSentiment: number;
  peakDiscussion: number;
  commentCount: number;
}

export interface Comment {
  id: string;
  nodeId: string;
  content: string;
  sentiment: SentimentType;
  likes: number;
  date: string;
  source: string;
}

export interface WatchItem {
  id: string;
  title: string;
  description: string;
  sourceUrl: string;
  priority: Priority;
  status: WatchStatus;
  assignee: string;
  nextReviewDate: string;
  createdAt: string;
  notes: string;
  relatedNodeId?: string;
}

export interface Competitor {
  name: string;
  score: number;
  discussionCount: number;
  positiveRatio: number;
}

export interface NodeDetail {
  node: VersionNode;
  dailyData: DailyTemperature[];
  comments: Comment[];
}
