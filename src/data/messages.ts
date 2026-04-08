import type { Conversation, Message } from "@/types";
import { MOCK_CREATORS } from "./users";

const [luna, marco, sophia, rafael, elena, kai] = MOCK_CREATORS;

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv_1",
    participant: luna,
    lastMessage: "Thank you so much! The Dolomites shoot was genuinely one of the most challenging I've done — glad it resonated 🙏",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: "conv_2",
    participant: marco,
    lastMessage: "The Amalfi villa is booked for September — thank you for the tip! 🌊",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: "conv_3",
    participant: sophia,
    lastMessage: "The brush pack is incredible. Layer 7 on the 'Organic Ink' brush is a game-changer.",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: "conv_4",
    participant: rafael,
    lastMessage: "Week 4 done. Down 3.2kg and PRs on all three main lifts. This program is no joke.",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: "conv_5",
    participant: elena,
    lastMessage: "Made the carbonara last night. My partner said it was better than what we had in Rome. That's saying something.",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: "conv_6",
    participant: kai,
    lastMessage: "Listened to Hollow again with your breakdown open — completely changed how I hear it.",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
    unreadCount: 0,
    isOnline: true,
  },
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  conv_1: [
    {
      id: "msg_1_1",
      fromUser: { id: "user_me", username: "alex_rivers", displayName: "Alex Rivers", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces", bio: "", isCreator: false, isVerified: false, createdAt: "" },
      toUserId: luna.id,
      content: "Luna! Just finished going through the full Dolomites shoot. The light in frame 23 — how did you even find that angle?",
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: "msg_1_2",
      fromUser: luna,
      toUserId: "user_me",
      content: "Thank you so much! The Dolomites shoot was genuinely one of the most challenging I've done — glad it resonated 🙏",
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
  ],
  conv_3: [
    {
      id: "msg_3_1",
      fromUser: { id: "user_me", username: "alex_rivers", displayName: "Alex Rivers", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces", bio: "", isCreator: false, isVerified: false, createdAt: "" },
      toUserId: sophia.id,
      content: "Sophia, just downloaded the brush pack. Haven't even tried them yet but the documentation alone is worth it.",
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    },
    {
      id: "msg_3_2",
      fromUser: sophia,
      toUserId: "user_me",
      content: "The brush pack is incredible. Layer 7 on the 'Organic Ink' brush is a game-changer.",
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    },
    {
      id: "msg_3_3",
      fromUser: sophia,
      toUserId: "user_me",
      content: "Let me know if you want me to do a live walkthrough sometime. Happy to do a session for subscribers 🎨",
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8 + 30000).toISOString(),
    },
  ],
};
