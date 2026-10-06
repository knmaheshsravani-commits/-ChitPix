import { Post, Story } from "./types";

export const mockUsers = [
  { id: "1", username: "arjun.vizag", displayName: "Arjun", avatarUrl: "", bio: "Vizag 🌊", verified: true, followersCount: 12400, followingCount: 500, postsCount: 89, createdAt: new Date().toISOString() },
  { id: "2", username: "sweety_hyd", displayName: "Sweety", avatarUrl: "", bio: "Hyderabad ❤️", followersCount: 8900, followingCount: 300, postsCount: 45, createdAt: new Date().toISOString() },
];

export const mockStories: Story[] = [
  { id: "s1", userId: "1", user: mockUsers[0] as any, imageUrl: "", viewed: false, createdAt: new Date().toISOString(), expiresAt: new Date().toISOString() },
  { id: "s2", userId: "2", user: mockUsers[1] as any, imageUrl: "", viewed: false, createdAt: new Date().toISOString(), expiresAt: new Date().toISOString() },
];

export const mockPosts: Post[] = [
  { id: "p1", userId: "1", user: mockUsers[0] as any, imageUrl: "https://picsum.photos/500/600?random=1", caption: "Vizag beach vibes 🌊 #ChitPix", likes: 1250, commentsCount: 89, isLiked: false, isSaved: false, createdAt: "2h ago" },
  { id: "p2", userId: "2", user: mockUsers[1] as any, imageUrl: "https://picsum.photos/500/600?random=2", caption: "Charminar nights ✨ Hyderabad", likes: 2100, commentsCount: 124, isLiked: true, isSaved: true, createdAt: "5h ago" },
];
