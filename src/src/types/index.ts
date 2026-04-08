export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  isCreator: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface Creator extends User {
  coverImage: string;
  subscriberCount: number;
  postCount: number;
  totalEarnings: number;
  subscriptionPrice: number;
  categories: string[];
  isSubscribed?: boolean;
  stats: CreatorStats;
}

export interface CreatorStats {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  monthlyEarnings: number;
  newSubscribers: number;
  conversionRate: number;
}

export interface Post {
  id: string;
  creatorId: string;
  creator: Creator;
  type: "image" | "video" | "text";
  thumbnail?: string;
  content?: string;
  teaserText: string;
  caption: string;
  isLocked: boolean;
  price: number;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;
  tags: string[];
}

export interface Message {
  id: string;
  fromUser: User;
  toUserId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participant: User;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isOnline: boolean;
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "unlock" | "new_post" | "tip";
  fromUser: User;
  message: string;
  isRead: boolean;
  createdAt: string;
  postId?: string;
}

export interface Transaction {
  id: string;
  type: "purchase" | "spend" | "tip" | "earning";
  amount: number;
  description: string;
  createdAt: string;
  postId?: string;
}

export interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  label: string;
  popular?: boolean;
  bonus?: number;
}

export interface DashboardMetric {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  trend: "up" | "down" | "neutral";
}

export interface ModerationItem {
  id: string;
  creator: Creator;
  type: "post" | "profile" | "comment";
  status: "pending" | "approved" | "rejected";
  reason?: string;
  content: string;
  thumbnail?: string;
  submittedAt: string;
  reviewedAt?: string;
}
