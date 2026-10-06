// ChitPix.com - Instagram of India - Core Types 2026

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
  verified?: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  imageUrl: string;
  caption?: string;
  likes: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved: boolean;
  location?: string;
  tags?: string[];
  createdAt: string;
}

export interface Story {
  id: string;
  userId: string;
  user: User;
  imageUrl: string;
  viewed: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: User;
  text: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  fromUser: User;
  postId?: string;
  text: string;
  read: boolean;
  createdAt: string;
}

export interface FeedResponse {
  posts: Post[];
  hasMore: boolean;
  nextCursor?: string;
}
