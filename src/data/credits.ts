import type { CreditPackage, Transaction } from "@/types";

export const DEFAULT_CREDITS = 500;

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "pack_starter",
    credits: 100,
    price: 4.99,
    label: "Starter",
  },
  {
    id: "pack_popular",
    credits: 500,
    price: 19.99,
    label: "Popular",
    popular: true,
    bonus: 50,
  },
  {
    id: "pack_creator",
    credits: 1200,
    price: 44.99,
    label: "Creator",
    bonus: 200,
  },
  {
    id: "pack_pro",
    credits: 3000,
    price: 99.99,
    label: "Pro",
    bonus: 750,
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "tx_1",
    type: "purchase",
    amount: 500,
    description: "Purchased Popular Pack",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "tx_2",
    type: "spend",
    amount: -90,
    description: "Unlocked: 12-Week Transformation Program by Rafael Santos",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    postId: "post_8",
  },
  {
    id: "tx_3",
    type: "spend",
    amount: -45,
    description: "Unlocked: The Golden Hour — Dolomites Shoot by Luna Chen",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    postId: "post_1",
  },
  {
    id: "tx_4",
    type: "tip",
    amount: -50,
    description: "Tip sent to Marco Di Vito",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "tx_5",
    type: "purchase",
    amount: 100,
    description: "Purchased Starter Pack",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
];

export const DASHBOARD_CHART_DATA = [
  { month: "Jan", earnings: 4200, subscribers: 8900 },
  { month: "Feb", earnings: 5100, subscribers: 9400 },
  { month: "Mar", earnings: 4800, subscribers: 9800 },
  { month: "Apr", earnings: 6200, subscribers: 10900 },
  { month: "May", earnings: 7400, subscribers: 11800 },
  { month: "Jun", earnings: 8200, subscribers: 12847 },
];
