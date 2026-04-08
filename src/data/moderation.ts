import type { ModerationItem } from "@/types";
import { MOCK_CREATORS } from "./users";

const [luna, marco, sophia, rafael, elena] = MOCK_CREATORS;

export const MOCK_MODERATION_ITEMS: ModerationItem[] = [
  {
    id: "mod_1",
    creator: luna,
    type: "post",
    status: "pending",
    content: "New exclusive series: intimate portraits from the Amalfi coast — 24-image set with full behind-the-scenes",
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop",
    submittedAt: new Date(Date.now() - 1000 * 60 * 23).toISOString(),
  },
  {
    id: "mod_2",
    creator: sophia,
    type: "post",
    status: "pending",
    content: "Process video: creating the 'Dreamscape' series — 6 hours of raw footage compressed into a 40-minute exclusive",
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
    submittedAt: new Date(Date.now() - 1000 * 60 * 67).toISOString(),
  },
  {
    id: "mod_3",
    creator: marco,
    type: "profile",
    status: "approved",
    content: "Profile bio update and cover image change — new lifestyle photography direction announced",
    thumbnail: "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=300&h=200&fit=crop",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "mod_4",
    creator: rafael,
    type: "post",
    status: "approved",
    content: "Advanced program: The Elite Performance Protocol — 16 weeks, for experienced athletes only",
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: "mod_5",
    creator: elena,
    type: "post",
    status: "rejected",
    reason: "Content description requires clearer preview. Please update the teaser text to better represent the content.",
    content: "Private dinner series — exclusive access to my monthly tasting menu events in Paris",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: "mod_6",
    creator: luna,
    type: "post",
    status: "pending",
    content: "Masterclass: reading light — a 3-part series on the single skill that separates good photographers from great ones",
    thumbnail: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=300&h=200&fit=crop",
    submittedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
  },
];
