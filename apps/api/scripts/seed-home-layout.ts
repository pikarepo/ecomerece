/**
 * Seed script: populate the Home layout document with
 * slides, promos, categories, features, and product containers.
 *
 * Run from repo root:
 *   bun run apps/api/scripts/seed-home-layout.ts
 */

import { resolve } from 'node:path';
import { config } from 'dotenv';

// Load env BEFORE any dynamic import that reads process.env at module load time
// (mongo.ts checks MONGO_URI at import, so we must use dynamic imports below)
config({ path: resolve(import.meta.dir, '../.env') });

// Dynamic imports so env is already set when these modules are evaluated
const { default: mongoose } = await import('mongoose');
const { HomeModel } = await import('../modules/home/infrastructure/home.models');
const { connectDB } = await import('../lib/mongo');
const { Id } = await import('@ecomerece/domain');

// ─── Constants ────────────────────────────────────────────────────────────────

const HAIRCARE_CATEGORY_ID = '01a0a4ba-6660-714e-a85d-e95b3d442fb2';
const SKINCARE_CATEGORY_ID = '01a0a516-1c89-7123-8db2-4c0a66facf82';
const HAIRCARE_IMAGE =
  'https://res.cloudinary.com/ezabelpf/image/upload/v1789470076/categories/0f43de91-c410-4ad2-8c72-b7e6ef8c147e.jpg';
const SKINCARE_IMAGE =
  'https://res.cloudinary.com/ezabelpf/image/upload/v1789476085/categories/e544f969-3e36-4a98-bf19-a18256470449.jpg';

// First images of seeded products — used for hero slides & promos
const SLIDE_IMAGES = {
  hairShampoo:
    'https://res.cloudinary.com/ezabelpf/image/upload/v1789485109/products/hydra-silk-shampoo/img-1.jpg.jpg',
  hairConditioner:
    'https://res.cloudinary.com/ezabelpf/image/upload/v1789485115/products/argan-repair-conditioner/img-1.jpg.jpg',
  hairOil:
    'https://res.cloudinary.com/ezabelpf/image/upload/v1789485130/products/coconut-nourish-hair-oil/img-1.jpg.jpg',
  skinMoisturiser:
    'https://res.cloudinary.com/ezabelpf/image/upload/v1789485150/products/hyaluronic-acid-moisturiser/img-1.jpg.jpg',
  skinSerum:
    'https://res.cloudinary.com/ezabelpf/image/upload/v1789485155/products/vitamin-c-brightening-serum/img-1.jpg.jpg',
  skinCleanser:
    'https://res.cloudinary.com/ezabelpf/image/upload/v1789485224/products/tea-tree-balancing-cleanser/img-1.jpg.jpg',
};

// Helper: generate a UUID v7 string using the domain Id value object (same as all other seeding)
function uuid(): string {
  return Id.create().value;
}

// ─── Home document payload ─────────────────────────────────────────────────────

const homePayload = {
  _id: 'home-main',

  // ── Hero slides (max 10) ─────────────────────────────────────────────────
  slides: [
    {
      id: uuid(),
      tag: 'New Arrival',
      title: 'Hydrate & Shine — Luxury Haircare',
      subhead: 'Professional salon results at home',
      subtitle: 'Infused with argan oil, keratin & silk proteins',
      cta: 'Shop Haircare',
      image: SLIDE_IMAGES.hairShampoo,
      accent: '#7c3aed',
      displayOrder: 0,
    },
    {
      id: uuid(),
      tag: 'Best Seller',
      title: 'Radiant Skin — Science-Backed Skincare',
      subhead: 'Clinically tested formulas',
      subtitle: 'Vitamin C, hyaluronic acid & niacinamide blends',
      cta: 'Shop Skincare',
      image: SLIDE_IMAGES.skinSerum,
      accent: '#db2777',
      displayOrder: 1,
    },
    {
      id: uuid(),
      tag: "Editor's Pick",
      title: 'Repair & Restore — Deep Conditioning',
      subhead: 'Strengthen from root to tip',
      subtitle: 'Keratin bond technology for frizz-free results',
      cta: 'Explore Now',
      image: SLIDE_IMAGES.hairConditioner,
      accent: '#0891b2',
      displayOrder: 2,
    },
    {
      id: uuid(),
      tag: 'Flash Sale',
      title: 'Cleanse & Glow — Tea Tree Collection',
      subhead: 'Up to 20% off this week',
      subtitle: 'Purify pores, balance oil, unlock your glow',
      cta: 'Grab the Deal',
      image: SLIDE_IMAGES.skinCleanser,
      accent: '#16a34a',
      displayOrder: 3,
    },
  ],

  // ── Promos (max 6) ────────────────────────────────────────────────────────
  promos: [
    {
      id: uuid(),
      title: 'Haircare Essentials',
      subtitle: 'Shampoos, masks & oils — all in one place.',
      image: SLIDE_IMAGES.hairOil,
      accent: '#7c3aed',
      link: `http://localhost:3000/client/categories?categoryId=${HAIRCARE_CATEGORY_ID}`,
    },
    {
      id: uuid(),
      title: 'Skincare Favourites',
      subtitle: 'Serums, moisturisers & cleansers for every skin type.',
      image: SLIDE_IMAGES.skinMoisturiser,
      accent: '#db2777',
      link: `http://localhost:3000/client/categories?categoryId=${SKINCARE_CATEGORY_ID}`,
    },
    {
      id: uuid(),
      title: 'Nourish Your Scalp',
      subtitle: 'Scalp cleansers and treatments for healthy roots.',
      image: SLIDE_IMAGES.hairShampoo,
      accent: '#0891b2',
      link: `http://localhost:3000/client/categories?categoryId=${HAIRCARE_CATEGORY_ID}`,
    },
    {
      id: uuid(),
      title: 'Glow Starter Kit',
      subtitle: 'Everything you need to start a skincare routine.',
      image: SLIDE_IMAGES.skinSerum,
      accent: '#ea580c',
      link: `http://localhost:3000/client/categories?categoryId=${SKINCARE_CATEGORY_ID}`,
    },
  ],

  // ── Category chips (max 24) ───────────────────────────────────────────────
  categories: [
    {
      id: uuid(),
      name: 'Haircare',
      image: HAIRCARE_IMAGE,
      accent: '#7c3aed',
      icon: 'Sparkles',
    },
    {
      id: uuid(),
      name: 'Skincare',
      image: SKINCARE_IMAGE,
      accent: '#db2777',
      icon: 'Star',
    },
  ],

  // ── Trust / feature strip (max 8) ─────────────────────────────────────────
  features: [
    {
      id: uuid(),
      title: 'Free Shipping',
      detail: 'On all orders above $35. Fast & reliable delivery to your door.',
      accent: '#7c3aed',
      icon: 'Truck',
    },
    {
      id: uuid(),
      title: 'Cruelty-Free',
      detail: 'Every product is ethically sourced and never tested on animals.',
      accent: '#16a34a',
      icon: 'Heart',
    },
    {
      id: uuid(),
      title: 'Dermatologist Approved',
      detail: 'Formulas reviewed and approved by certified dermatologists.',
      accent: '#0891b2',
      icon: 'ShieldCheck',
    },
    {
      id: uuid(),
      title: '30-Day Returns',
      detail: 'Not satisfied? Return within 30 days for a full, hassle-free refund.',
      accent: '#ea580c',
      icon: 'RotateCcw',
    },
  ],

  // ── Product containers / shelves (max 15) ─────────────────────────────────
  productContainers: [
    {
      id: uuid(),
      heading: 'Trending in Haircare',
      subTitle: 'Top-rated shampoos, conditioners & treatments',
      query: {
        filter: { categoryId: HAIRCARE_CATEGORY_ID, appearance: 'public' },
        cursor: null,
        limit: 12,
        direction: 'next',
        sort: { 'stats.viewCount': -1 },
      },
      displayOrder: 0,
    },
    {
      id: uuid(),
      heading: 'Best Skincare Picks',
      subTitle: 'Serums, moisturisers & cleansers your skin will love',
      query: {
        filter: { categoryId: SKINCARE_CATEGORY_ID, appearance: 'public' },
        cursor: null,
        limit: 12,
        direction: 'next',
        sort: { 'stats.viewCount': -1 },
      },
      displayOrder: 1,
    },
    {
      id: uuid(),
      heading: 'New Arrivals',
      subTitle: 'Fresh additions — be the first to shop',
      query: {
        filter: { appearance: 'public' },
        cursor: null,
        limit: 10,
        direction: 'next',
        sort: { createdAt: -1 },
      },
      displayOrder: 2,
    },
  ],

  version: 1,
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await connectDB();
  console.log('[home-seed] connected to MongoDB');

  const existing = await HomeModel.findById('home-main');

  if (existing) {
    // Replace in-place to preserve _id and timestamps.createdAt
    await HomeModel.findByIdAndUpdate('home-main', homePayload, { overwrite: true, new: true });
    console.log('[home-seed] updated existing home-main document');
  } else {
    await HomeModel.create(homePayload);
    console.log('[home-seed] created home-main document');
  }

  const result = await HomeModel.findById('home-main', {
    'slides.title': 1,
    'categories.name': 1,
    'promos.title': 1,
    'features.title': 1,
    'productContainers.heading': 1,
  });

  console.log('[home-seed] Summary:');
  console.log(
    '  slides:',
    result?.slides?.length,
    result?.slides?.map((s: any) => s.title),
  );
  console.log(
    '  promos:',
    result?.promos?.length,
    result?.promos?.map((p: any) => p.title),
  );
  console.log(
    '  categories:',
    result?.categories?.length,
    result?.categories?.map((c: any) => c.name),
  );
  console.log(
    '  features:',
    result?.features?.length,
    result?.features?.map((f: any) => f.title),
  );
  console.log(
    '  productContainers:',
    result?.productContainers?.length,
    result?.productContainers?.map((c: any) => c.heading),
  );

  await mongoose.disconnect();
  console.log('[home-seed] done.');
}

main().catch((err) => {
  console.error('[home-seed] FATAL:', err);
  process.exit(1);
});
