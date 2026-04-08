import type { Post } from "@/types";
import { MOCK_CREATORS } from "./users";

const [luna, marco, sophia, rafael, elena, kai] = MOCK_CREATORS;

export const MOCK_POSTS: Post[] = [
  // Luna Chen posts
  {
    id: "post_1",
    creatorId: luna.id,
    creator: luna,
    type: "image",
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop",
    teaserText: "The golden hour I almost missed — exclusive behind-the-scenes from the Dolomites shoot",
    caption: "Three days in the Dolomites waiting for this exact light. 4AM wake-ups, freezing temperatures, and absolute solitude. The reward was this — a moment that exists nowhere else. Full shoot + location guide inside.",
    isLocked: true,
    price: 45,
    likeCount: 3_847,
    commentCount: 142,
    viewCount: 28_400,
    createdAt: "2024-06-10T07:30:00Z",
    tags: ["Photography", "Mountains", "Travel", "GoldenHour"],
  },
  {
    id: "post_2",
    creatorId: luna.id,
    creator: luna,
    type: "image",
    thumbnail: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&h=600&fit=crop",
    teaserText: "Tokyo at 3AM — when the city becomes something else entirely",
    caption: "There's a version of Tokyo that most visitors never see. I spent four nights shooting the city after midnight, when the silence reveals something raw and honest. 47 images. Notes on technique, light, and staying invisible.",
    isLocked: false,
    price: 0,
    likeCount: 6_213,
    commentCount: 287,
    viewCount: 54_100,
    createdAt: "2024-06-05T03:15:00Z",
    tags: ["Photography", "Tokyo", "NightPhotography", "Urban"],
  },
  {
    id: "post_3",
    creatorId: luna.id,
    creator: luna,
    type: "image",
    thumbnail: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&h=600&fit=crop",
    teaserText: "My complete Lightroom presets bundle — 8 years of editing distilled into 12 presets",
    caption: "I've been refining these for 8 years. These aren't trendy filters — they're tools built around how I see light. Includes full tutorial on how I adapt each preset to different conditions.",
    isLocked: true,
    price: 80,
    likeCount: 8_941,
    commentCount: 534,
    viewCount: 71_200,
    createdAt: "2024-05-28T14:00:00Z",
    tags: ["Photography", "Lightroom", "Tutorial", "Presets"],
  },

  // Marco posts
  {
    id: "post_4",
    creatorId: marco.id,
    creator: marco,
    type: "image",
    thumbnail: "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=600&h=600&fit=crop",
    teaserText: "Inside the Milan apartment that redefined how I think about space",
    caption: "A 90m² apartment in the Brera district that feels like a palazzo. The architect agreed to let me document the entire space — every detail, every material choice, and the philosophy behind it. Interior guide included.",
    isLocked: false,
    price: 0,
    likeCount: 4_122,
    commentCount: 198,
    viewCount: 32_800,
    createdAt: "2024-06-08T11:00:00Z",
    tags: ["Architecture", "Interior", "Milan", "Design"],
  },
  {
    id: "post_5",
    creatorId: marco.id,
    creator: marco,
    type: "image",
    thumbnail: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=600&fit=crop",
    teaserText: "The Amalfi villa nobody knows — and how I booked it for €180/night",
    caption: "Seven days on the Amalfi coast in a private villa with a private pool, away from the tourist circuit. I'm sharing exactly how I found it, how to negotiate the rate, and a full day-by-day itinerary.",
    isLocked: true,
    price: 55,
    likeCount: 7_843,
    commentCount: 412,
    viewCount: 61_400,
    createdAt: "2024-06-01T09:00:00Z",
    tags: ["Travel", "Amalfi", "Luxury", "Lifestyle"],
  },

  // Sophia posts
  {
    id: "post_6",
    creatorId: sophia.id,
    creator: sophia,
    type: "image",
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
    teaserText: "Time-lapse of my entire illustration process — 40 hours in 18 minutes",
    caption: "From blank canvas to the final piece. Every brushstroke, every layer, every mistake and correction. I narrate the creative decisions as they happen. The full process file is included if you want to study the layers.",
    isLocked: true,
    price: 60,
    likeCount: 12_341,
    commentCount: 876,
    viewCount: 98_700,
    createdAt: "2024-06-09T16:00:00Z",
    tags: ["Art", "Process", "Illustration", "Tutorial"],
  },
  {
    id: "post_7",
    creatorId: sophia.id,
    creator: sophia,
    type: "image",
    thumbnail: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=600&fit=crop",
    teaserText: "My Procreate brush pack — 34 custom brushes I use for every piece",
    caption: "After two years of requests: here they are. 34 brushes built specifically for my style. Includes a companion PDF explaining when and how I use each one.",
    isLocked: true,
    price: 40,
    likeCount: 21_094,
    commentCount: 1_243,
    viewCount: 187_400,
    createdAt: "2024-05-20T12:00:00Z",
    tags: ["Art", "Procreate", "Resources", "Digital Art"],
  },

  // Rafael posts
  {
    id: "post_8",
    creatorId: rafael.id,
    creator: rafael,
    type: "image",
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop",
    teaserText: "The 12-week program that helped 400+ people transform — complete PDF inside",
    caption: "Built for people who've tried everything. 12 weeks, zero fluff, progressive overload that actually makes sense. Includes the nutrition framework that makes it sustainable. 400+ transformations so far.",
    isLocked: true,
    price: 90,
    likeCount: 32_450,
    commentCount: 2_187,
    viewCount: 412_000,
    createdAt: "2024-06-03T06:00:00Z",
    tags: ["Fitness", "Training", "Transformation", "Health"],
  },
  {
    id: "post_9",
    creatorId: rafael.id,
    creator: rafael,
    type: "image",
    thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop",
    teaserText: "Free: my morning protocol that replaced 2 hours of gym time",
    caption: "22 minutes. That's all it takes. I designed this for travel days when I can't access a gym — but it turned out to be one of the most effective things I do. Completely free, no equipment, works anywhere.",
    isLocked: false,
    price: 0,
    likeCount: 48_720,
    commentCount: 3_412,
    viewCount: 687_000,
    createdAt: "2024-05-25T07:00:00Z",
    tags: ["Fitness", "Free", "Morning", "NoEquipment"],
  },

  // Elena posts
  {
    id: "post_10",
    creatorId: elena.id,
    creator: elena,
    type: "image",
    thumbnail: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=600&fit=crop",
    teaserText: "The pasta carbonara recipe my Michelin-starred chef friend made me swear not to share",
    caption: "I promised I'd keep this private. Then I thought — if I can't share it here, where can I? The real technique, the real ingredient ratios, and the one step everyone skips. This is the version served in Rome's best trattorias.",
    isLocked: true,
    price: 35,
    likeCount: 9_834,
    commentCount: 743,
    viewCount: 84_200,
    createdAt: "2024-06-07T13:00:00Z",
    tags: ["Cooking", "Recipe", "Italian", "Pasta"],
  },

  // Kai posts
  {
    id: "post_11",
    creatorId: kai.id,
    creator: kai,
    type: "image",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=600&fit=crop",
    teaserText: "Full breakdown: how I produced 'Hollow' — the track that got 10M streams",
    caption: "I'm walking through every decision in this track. The chord progression that took 3 weeks to find. The sample that made the whole thing click. The mix decisions that almost didn't happen. Every plugin, setting, and creative choice.",
    isLocked: true,
    price: 70,
    likeCount: 15_621,
    commentCount: 1_089,
    viewCount: 143_000,
    createdAt: "2024-06-06T20:00:00Z",
    tags: ["Music", "Production", "Tutorial", "BehindTheScenes"],
  },
  {
    id: "post_12",
    creatorId: kai.id,
    creator: kai,
    type: "image",
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop",
    teaserText: "Free sample pack: 100 royalty-free loops from my personal archive",
    caption: "These are sounds from my production archive — some go back 8 years. Completely royalty-free, use them in anything. No strings attached. Just a gift to the community that's supported me.",
    isLocked: false,
    price: 0,
    likeCount: 28_940,
    commentCount: 2_310,
    viewCount: 312_000,
    createdAt: "2024-05-15T18:00:00Z",
    tags: ["Music", "Free", "SamplePack", "Production"],
  },
];

export function getPostsByCreator(creatorId: string): Post[] {
  return MOCK_POSTS.filter((p) => p.creatorId === creatorId);
}

export function getPostById(id: string): Post | undefined {
  return MOCK_POSTS.find((p) => p.id === id);
}

export function getFeedPosts(): Post[] {
  return [...MOCK_POSTS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
