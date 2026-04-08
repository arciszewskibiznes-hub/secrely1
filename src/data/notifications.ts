import type { Notification } from "@/types";
import { MOCK_CREATORS } from "./users";

const [luna, marco, sophia, rafael, elena, kai] = MOCK_CREATORS;

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif_1",
    type: "new_post",
    fromUser: luna,
    message: "Luna Chen posted new exclusive content: 'The golden hour I almost missed'",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    postId: "post_1",
  },
  {
    id: "notif_2",
    type: "like",
    fromUser: marco,
    message: "Marco Di Vito liked your comment on their Milan apartment post",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    postId: "post_4",
  },
  {
    id: "notif_3",
    type: "follow",
    fromUser: sophia,
    message: "Sophia Nakamura started following you",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "notif_4",
    type: "unlock",
    fromUser: rafael,
    message: "You unlocked Rafael Santos' 12-week transformation program",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    postId: "post_8",
  },
  {
    id: "notif_5",
    type: "new_post",
    fromUser: kai,
    message: "Kai Okafor dropped a new tutorial: 'How I produced Hollow'",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    postId: "post_11",
  },
  {
    id: "notif_6",
    type: "tip",
    fromUser: elena,
    message: "Someone sent you a 50 credit tip 🎉",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "notif_7",
    type: "comment",
    fromUser: luna,
    message: "Luna Chen replied to your comment: 'Yes, that's exactly it — the light at that elevation is...'",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    postId: "post_2",
  },
  {
    id: "notif_8",
    type: "follow",
    fromUser: marco,
    message: "Marco Di Vito started following you",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];
