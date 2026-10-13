/**
 * Master seed script — run this after clearing the DB.
 * Order: categories → vendors → products+variants → home layout
 * Safe to re-run: skips docs that already exist.
 *
 * Run from repo root:
 *   bun run apps/api/scripts/seed-all.ts
 */

import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { config } from 'dotenv';

config({ path: resolve(import.meta.dir, '../.env') });

const { default: mongoose } = await import('mongoose');
const { connectDB } = await import('../lib/mongo');
const { Id, ImageSource } = await import('@ecomerece/domain');
const { ProductModel } = await import('../modules/product/infrastructure/product.model');
const { ProductVariantModel } = await import(
  '../modules/product-variant/infrastructure/product-variant.model'
);
const { HomeModel } = await import('../modules/home/infrastructure/home.models');
const { CloudinaryAdapter } = await import(
  '../modules/image-storage/infrastructure/cloudinary.adapter'
);
const { loadCloudinaryConfig } = await import(
  '../modules/image-storage/infrastructure/cloudinary.config'
);

await connectDB();
console.log('[seed-all] connected to MongoDB');
const db = mongoose.connection.db!;
const now = new Date();

// ─── helpers ──────────────────────────────────────────────────────────────────

function uid(): string {
  return Id.create().value;
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function runPool<T>(tasks: (() => Promise<T>)[], concurrency: number): Promise<void> {
  const queue = [...tasks];
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length) {
      const task = queue.shift();
      if (task) await task();
    }
  });
  await Promise.all(workers);
}

// ─── 1. CATEGORIES ────────────────────────────────────────────────────────────

const HAIRCARE_ID = '01a0a4ba-6660-714e-a85d-e95b3d442fb2';
const SKINCARE_ID = '01a0a516-1c89-7123-8db2-4c0a66facf82';

const HAIRCARE_IMG =
  'https://res.cloudinary.com/ezabelpf/image/upload/v1789470076/categories/0f43de91-c410-4ad2-8c72-b7e6ef8c147e.jpg';
const SKINCARE_IMG =
  'https://res.cloudinary.com/ezabelpf/image/upload/v1789476085/categories/e544f969-3e36-4a98-bf19-a18256470449.jpg';

const categories = [
  {
    _id: HAIRCARE_ID,
    title: 'Haircare',
    image: HAIRCARE_IMG,
    createdBy: 'system',
    version: 0,
    block: { blocked: false, blockedFrom: null, blockedBy: null, reason: null },
    deleted: { deleted: false, deletedFrom: null, deletedBy: null, reason: null },
    imageKey: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: SKINCARE_ID,
    title: 'Skincare',
    image: SKINCARE_IMG,
    createdBy: 'system',
    version: 0,
    block: { blocked: false, blockedFrom: null, blockedBy: null, reason: null },
    deleted: { deleted: false, deletedFrom: null, deletedBy: null, reason: null },
    imageKey: null,
    createdAt: now,
    updatedAt: now,
  },
];

console.log('\n[seed-all] ── Step 1: Categories ──');
let catCreated = 0;
for (const cat of categories) {
  const exists = await db.collection('categories').findOne({ _id: cat._id as any });
  if (exists) {
    console.log(`  SKIP  "${cat.title}"`);
  } else {
    await db.collection('categories').insertOne(cat as any);
    console.log(`  CREATE "${cat.title}"`);
    catCreated++;
  }
}
console.log(`  → ${catCreated} created`);

// ─── 2. VENDORS ───────────────────────────────────────────────────────────────

const VENDOR_IDS = [
  '01a09f82-cd47-7621-81e2-b40a319d4996',
  '01a09f85-4bdc-767a-83dc-db90e852c94a',
  '01a09f87-ec73-7533-bf05-306d7bd4cda0',
];

const vendors = [
  {
    _id: VENDOR_IDS[0],
    ownerId: '01a09f82-0000-7000-0000-000000000001',
    title: 'Tech Hub Plus',
    slug: 'tech-hub-plus',
    description: 'Premium beauty and personal care products for the modern consumer.',
    images: { logo: HAIRCARE_IMG, banner: HAIRCARE_IMG, logoKey: null, bannerKey: null },
    contact: {
      phone: '+1-555-0101',
      email: 'info@techhubplus.com',
      address: {
        streetAddress: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      },
    },
    verification: { isVerified: true, verifiedAt: now },
    version: 0,
    statsRefreshEnabled: true,
    stats: {
      views: 0,
      clicks: 0,
      purchases: 0,
      revenue: 0,
      quantity: 0,
      addToCart: 0,
      wishlist: 0,
      refunds: 0,
      refundAmount: 0,
    },
    deleted: { deleted: false, deletedFrom: null, deletedBy: null, reason: null },
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: VENDOR_IDS[1],
    ownerId: '01a09f85-0000-7000-0000-000000000002',
    title: 'Sunrise Electronics',
    slug: 'sunrise-electronics',
    description: 'Trusted source for professional-grade hair and skin treatments.',
    images: { logo: SKINCARE_IMG, banner: SKINCARE_IMG, logoKey: null, bannerKey: null },
    contact: {
      phone: '+1-555-0202',
      email: 'hello@sunriseelectronics.com',
      address: {
        streetAddress: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        country: 'US',
      },
    },
    verification: { isVerified: true, verifiedAt: now },
    version: 0,
    statsRefreshEnabled: true,
    stats: {
      views: 0,
      clicks: 0,
      purchases: 0,
      revenue: 0,
      quantity: 0,
      addToCart: 0,
      wishlist: 0,
      refunds: 0,
      refundAmount: 0,
    },
    deleted: { deleted: false, deletedFrom: null, deletedBy: null, reason: null },
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: VENDOR_IDS[2],
    ownerId: '01a09f87-0000-7000-0000-000000000003',
    title: 'Green Leaf Grocery',
    slug: 'green-leaf-grocery',
    description: 'Natural and organic beauty essentials, sourced sustainably.',
    images: { logo: HAIRCARE_IMG, banner: HAIRCARE_IMG, logoKey: null, bannerKey: null },
    contact: {
      phone: '+1-555-0303',
      email: 'shop@greenleafgrocery.com',
      address: {
        streetAddress: '789 Elm Rd',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'US',
      },
    },
    verification: { isVerified: true, verifiedAt: now },
    version: 0,
    statsRefreshEnabled: true,
    stats: {
      views: 0,
      clicks: 0,
      purchases: 0,
      revenue: 0,
      quantity: 0,
      addToCart: 0,
      wishlist: 0,
      refunds: 0,
      refundAmount: 0,
    },
    deleted: { deleted: false, deletedFrom: null, deletedBy: null, reason: null },
    createdAt: now,
    updatedAt: now,
  },
];

const VENDOR_TITLES = ['Tech Hub Plus', 'Sunrise Electronics', 'Green Leaf Grocery'];

console.log('\n[seed-all] ── Step 2: Vendors ──');
let vendorCreated = 0;
for (const vendor of vendors) {
  const exists = await db.collection('vendors').findOne({ _id: vendor._id as any });
  if (exists) {
    console.log(`  SKIP  "${vendor.title}"`);
  } else {
    await db.collection('vendors').insertOne(vendor as any);
    console.log(`  CREATE "${vendor.title}"`);
    vendorCreated++;
  }
}
console.log(`  → ${vendorCreated} created`);

// ─── 3. PRODUCTS + VARIANTS ───────────────────────────────────────────────────

interface SeedVariant {
  label: string;
  price: number;
  discountPct: number;
}
interface SeedProduct {
  title: string;
  categoryId: string;
  vendorIdx: number;
  description: string;
  inStock: boolean;
  ingredients: { isIngredients: boolean; items: string[] };
  disclaimers: { name: string; title: string }[];
  variantSeeds: SeedVariant[];
  rating: { average: number; totalCount: number };
  imageCount: number;
}

const IMAGE_POOL = [
  '1596462502278-27bfdc403348',
  '1556228720-195a672e8a03',
  '1611930022073-b7a4ba5fcccd',
  '1556228578-0d85b1a4d571',
  '1535585209827-a15fcdbc4c2d',
  '1583209814683-c023dd293cc6',
  '1598440947619-2c35fc9aa908',
  '1571781926291-c477ebfd024b',
  '1608248543803-ba4f8c70ae0b',
  '1620916566398-39f1143ab7be',
  '1576091160550-2173dba999ef',
  '1612817288484-6f916006741a',
  '1586495777744-4413f21062fa',
  '1559599101-f09722fb4948',
  '1580618672591-eb180b1a973f',
  '1596178065887-1198b6148b2b',
  '1585232004423-244e0e6904e3',
  '1616394584738-fc6e612e71b9',
  '1601049541289-9b1b7bbbfe19',
  '1619451334792-150fd785ee74',
  '1576091160399-112ba8d25d1d',
  '1600948836101-f9ffda59d250',
  '1622398925373-3f91b1e275f5',
  '1535378917042-10a22c95931a',
  '1503023345310-bd7c1de61c7d',
];

const PRODUCTS: SeedProduct[] = [
  {
    title: 'Hydra Silk Shampoo',
    categoryId: HAIRCARE_ID,
    vendorIdx: 0,
    description:
      'A sulfate-free hydrating shampoo infused with silk proteins and argan oil for soft, bouncy hair.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: [
        'Water',
        'Sodium Lauroyl Methyl Isethionate',
        'Argan Oil',
        'Silk Proteins',
        'Panthenol',
      ],
    },
    disclaimers: [{ name: 'External use only', title: 'Avoid direct contact with eyes.' }],
    variantSeeds: [
      { label: '250ml', price: 16, discountPct: 20 },
      { label: '500ml', price: 28, discountPct: 10 },
      { label: '1L', price: 38, discountPct: 10 },
    ],
    rating: { average: 4.7, totalCount: 312 },
    imageCount: 4,
  },
  {
    title: 'Argan Repair Conditioner',
    categoryId: HAIRCARE_ID,
    vendorIdx: 0,
    description:
      'Deep-repair conditioner with argan oil and keratin that restores damaged hair to silky smoothness.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: ['Water', 'Cetearyl Alcohol', 'Argan Oil', 'Keratin', 'Glycerin'],
    },
    disclaimers: [],
    variantSeeds: [
      { label: '250ml', price: 18, discountPct: 15 },
      { label: '500ml', price: 30, discountPct: 10 },
    ],
    rating: { average: 4.5, totalCount: 198 },
    imageCount: 4,
  },
  {
    title: 'Volumizing Root Lift Spray',
    categoryId: HAIRCARE_ID,
    vendorIdx: 1,
    description:
      'Lightweight root-lifting spray that adds body and lift without weighing hair down.',
    inStock: true,
    ingredients: { isIngredients: false, items: [] },
    disclaimers: [],
    variantSeeds: [
      { label: '150ml', price: 14, discountPct: 20 },
      { label: '250ml', price: 22, discountPct: 15 },
    ],
    rating: { average: 4.3, totalCount: 145 },
    imageCount: 4,
  },
  {
    title: 'Keratin Smoothing Hair Mask',
    categoryId: HAIRCARE_ID,
    vendorIdx: 1,
    description: 'Intensive 5-minute keratin mask that tames frizz and adds long-lasting shine.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: ['Water', 'Keratin', 'Shea Butter', 'Coconut Oil', 'Panthenol'],
    },
    disclaimers: [{ name: 'Deep condition', title: 'Leave on for 5–10 minutes for best results.' }],
    variantSeeds: [{ label: '200ml', price: 22, discountPct: 15 }],
    rating: { average: 4.8, totalCount: 421 },
    imageCount: 3,
  },
  {
    title: 'Coconut Nourish Hair Oil',
    categoryId: HAIRCARE_ID,
    vendorIdx: 2,
    description:
      'Pure cold-pressed coconut oil blended with vitamin E that deeply nourishes and protects each strand.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: ['Cocos Nucifera Oil', 'Tocopherol', 'Rosmarinus Officinalis'],
    },
    disclaimers: [],
    variantSeeds: [
      { label: '100ml', price: 12, discountPct: 20 },
      { label: '200ml', price: 20, discountPct: 15 },
    ],
    rating: { average: 4.6, totalCount: 278 },
    imageCount: 3,
  },
  {
    title: 'Color Protect Shampoo',
    categoryId: HAIRCARE_ID,
    vendorIdx: 0,
    description: 'Color-safe shampoo that locks in vibrancy and prevents fade for up to 8 weeks.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: ['Water', 'Sodium Lauroyl Methyl Isethionate', 'UV Filter', 'Quinoa Protein'],
    },
    disclaimers: [],
    variantSeeds: [
      { label: '250ml', price: 17, discountPct: 15 },
      { label: '500ml', price: 29, discountPct: 10 },
    ],
    rating: { average: 4.4, totalCount: 167 },
    imageCount: 4,
  },
  {
    title: 'Micellar Scalp Cleanser',
    categoryId: HAIRCARE_ID,
    vendorIdx: 1,
    description:
      'Gentle micellar formula that removes build-up and excess sebum while preserving the scalp microbiome.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: ['Water', 'Micellar Complex', 'Salicylic Acid', 'Niacinamide'],
    },
    disclaimers: [],
    variantSeeds: [{ label: '200ml', price: 19, discountPct: 20 }],
    rating: { average: 4.2, totalCount: 93 },
    imageCount: 3,
  },
  {
    title: 'Curl Defining Cream',
    categoryId: HAIRCARE_ID,
    vendorIdx: 2,
    description:
      'Frizz-fighting curl cream that defines, hydrates, and holds natural curl patterns all day.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: ['Water', 'Shea Butter', 'Flaxseed Extract', 'Glycerin', 'Castor Oil'],
    },
    disclaimers: [],
    variantSeeds: [
      { label: '150ml', price: 15, discountPct: 20 },
      { label: '300ml', price: 25, discountPct: 15 },
    ],
    rating: { average: 4.5, totalCount: 214 },
    imageCount: 4,
  },
  {
    title: 'Heat Shield Protectant Mist',
    categoryId: HAIRCARE_ID,
    vendorIdx: 0,
    description:
      'Lightweight heat protectant mist that shields hair from up to 230°C styling tools.',
    inStock: true,
    ingredients: { isIngredients: false, items: [] },
    disclaimers: [
      { name: 'Heat protection', title: 'Spray evenly before using heat styling tools.' },
    ],
    variantSeeds: [{ label: '150ml', price: 13, discountPct: 20 }],
    rating: { average: 4.3, totalCount: 156 },
    imageCount: 3,
  },
  {
    title: 'Sea Salt Texturizing Spray',
    categoryId: HAIRCARE_ID,
    vendorIdx: 1,
    description: 'Beach-inspired sea salt spray that adds effortless texture and tousled waves.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: ['Water', 'Sea Salt', 'Aloe Vera', 'Provitamin B5'],
    },
    disclaimers: [],
    variantSeeds: [
      { label: '150ml', price: 11, discountPct: 20 },
      { label: '250ml', price: 17, discountPct: 15 },
    ],
    rating: { average: 4.1, totalCount: 88 },
    imageCount: 4,
  },
  {
    title: 'Biotin Boost Hair Serum',
    categoryId: HAIRCARE_ID,
    vendorIdx: 2,
    description:
      'Concentrated biotin serum that strengthens hair follicles and reduces breakage for thicker-looking hair.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: ['Aqua', 'Biotin', 'Caffeine', 'Niacinamide', 'Peptides'],
    },
    disclaimers: [],
    variantSeeds: [{ label: '50ml', price: 24, discountPct: 20 }],
    rating: { average: 4.6, totalCount: 302 },
    imageCount: 3,
  },
  {
    title: 'Anti-Dandruff Zinc Shampoo',
    categoryId: HAIRCARE_ID,
    vendorIdx: 0,
    description:
      'Clinically proven zinc pyrithione formula that eliminates dandruff flakes and soothes itchy scalp.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: ['Water', 'Zinc Pyrithione', 'Tea Tree Oil', 'Salicylic Acid'],
    },
    disclaimers: [
      { name: 'Scalp treatment', title: 'Leave lather on for 2 minutes before rinsing.' },
    ],
    variantSeeds: [
      { label: '250ml', price: 15, discountPct: 15 },
      { label: '500ml', price: 26, discountPct: 10 },
    ],
    rating: { average: 4.4, totalCount: 389 },
    imageCount: 4,
  },
  {
    title: 'Leave-In Detangling Milk',
    categoryId: HAIRCARE_ID,
    vendorIdx: 1,
    description:
      'Creamy leave-in conditioner that instantly detangles, reduces breakage, and leaves hair silky soft.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: ['Water', 'Cetearyl Alcohol', 'Silk Amino Acids', 'Aloe Vera'],
    },
    disclaimers: [],
    variantSeeds: [{ label: '200ml', price: 16, discountPct: 20 }],
    rating: { average: 4.5, totalCount: 177 },
    imageCount: 3,
  },
  {
    title: 'Hyaluronic Glow Serum',
    categoryId: SKINCARE_ID,
    vendorIdx: 0,
    description:
      'Multi-weight hyaluronic acid serum that plumps and hydrates all skin layers for a lasting dewy glow.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: ['Water', 'Sodium Hyaluronate', 'Glycerin', 'Niacinamide', 'Vitamin B5'],
    },
    disclaimers: [],
    variantSeeds: [
      { label: '30ml', price: 28, discountPct: 20 },
      { label: '50ml', price: 42, discountPct: 15 },
    ],
    rating: { average: 4.8, totalCount: 534 },
    imageCount: 4,
  },
  {
    title: 'Vitamin C Brightening Cream',
    categoryId: SKINCARE_ID,
    vendorIdx: 1,
    description:
      'Stable 15% vitamin C moisturiser that fades dark spots and brightens dull skin in 4 weeks.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: ['Ascorbic Acid', 'Water', 'Niacinamide', 'Ferulic Acid', 'Vitamin E'],
    },
    disclaimers: [{ name: 'Sun sensitivity', title: 'Always follow with SPF in the morning.' }],
    variantSeeds: [
      { label: '50ml', price: 35, discountPct: 20 },
      { label: '100ml', price: 58, discountPct: 15 },
    ],
    rating: { average: 4.7, totalCount: 412 },
    imageCount: 4,
  },
  {
    title: 'Retinol Renewal Night Serum',
    categoryId: SKINCARE_ID,
    vendorIdx: 2,
    description:
      'Encapsulated 0.3% retinol serum that smooths fine lines and renews skin texture while you sleep.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: ['Water', 'Retinol', 'Squalane', 'Ceramides', 'Peptides'],
    },
    disclaimers: [{ name: 'PM only', title: 'Use at night only. Start 2–3 times per week.' }],
    variantSeeds: [{ label: '30ml', price: 45, discountPct: 20 }],
    rating: { average: 4.6, totalCount: 298 },
    imageCount: 3,
  },
  {
    title: 'Gentle Foam Cleanser',
    categoryId: SKINCARE_ID,
    vendorIdx: 0,
    description:
      'pH-balanced foaming cleanser that removes makeup and impurities without stripping the skin barrier.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: ['Water', 'Glycerin', 'Cocamidopropyl Betaine', 'Ceramide NP', 'Allantoin'],
    },
    disclaimers: [],
    variantSeeds: [
      { label: '150ml', price: 18, discountPct: 15 },
      { label: '300ml', price: 30, discountPct: 10 },
    ],
    rating: { average: 4.5, totalCount: 267 },
    imageCount: 4,
  },
  {
    title: 'Broad Spectrum SPF50 Sunscreen',
    categoryId: SKINCARE_ID,
    vendorIdx: 1,
    description:
      'Lightweight mineral + chemical hybrid SPF50 that leaves zero white cast and doubles as a moisturiser.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: ['Zinc Oxide', 'Octinoxate', 'Water', 'Glycerin', 'Niacinamide'],
    },
    disclaimers: [{ name: 'Reapply', title: 'Reapply every 2 hours when outdoors.' }],
    variantSeeds: [{ label: '50ml', price: 22, discountPct: 15 }],
    rating: { average: 4.7, totalCount: 621 },
    imageCount: 4,
  },
  {
    title: 'Rose Deep Hydration Toner',
    categoryId: SKINCARE_ID,
    vendorIdx: 2,
    description:
      'Alcohol-free rose water toner packed with hyaluronic acid that preps skin for serums and locks in moisture.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: ['Rosa Damascena Water', 'Sodium Hyaluronate', 'Glycerin', 'Allantoin'],
    },
    disclaimers: [],
    variantSeeds: [
      { label: '150ml', price: 16, discountPct: 20 },
      { label: '300ml', price: 26, discountPct: 15 },
    ],
    rating: { average: 4.4, totalCount: 183 },
    imageCount: 4,
  },
  {
    title: 'Niacinamide Pore Control',
    categoryId: SKINCARE_ID,
    vendorIdx: 0,
    description:
      '10% niacinamide serum that visibly minimises pores, controls oil and evens skin tone.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: ['Water', 'Niacinamide', 'Zinc PCA', 'Hyaluronic Acid'],
    },
    disclaimers: [],
    variantSeeds: [{ label: '30ml', price: 21, discountPct: 20 }],
    rating: { average: 4.6, totalCount: 487 },
    imageCount: 3,
  },
  {
    title: 'Collagen Firming Eye Cream',
    categoryId: SKINCARE_ID,
    vendorIdx: 1,
    description:
      'Peptide-rich eye cream that reduces puffiness, dark circles and fine lines around the delicate eye area.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: ['Water', 'Collagen', 'Peptides', 'Caffeine', 'Vitamin K'],
    },
    disclaimers: [],
    variantSeeds: [{ label: '15ml', price: 21, discountPct: 25 }],
    rating: { average: 4.3, totalCount: 122 },
    imageCount: 3,
  },
  {
    title: 'Charcoal Detox Clay Mask',
    categoryId: SKINCARE_ID,
    vendorIdx: 0,
    description:
      'Deep-clearing 5-minute mask with activated charcoal and kaolin clay that draws out impurities and unclogs pores.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: ['Water', 'Kaolin', 'Activated Charcoal', 'Bentonite', 'Glycerin'],
    },
    disclaimers: [],
    variantSeeds: [
      { label: '50ml', price: 18, discountPct: 20 },
      { label: '100ml', price: 29, discountPct: 15 },
    ],
    rating: { average: 4.1, totalCount: 204 },
    imageCount: 4,
  },
  {
    title: 'Aloe Vera Soothing Moisturizer',
    categoryId: SKINCARE_ID,
    vendorIdx: 1,
    description:
      'Gel moisturiser with 92% aloe vera that instantly soothes, cools, and hydrates sensitive skin.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: ['Aloe Vera', 'Water', 'Glycerin', 'Sodium Hyaluronate'],
    },
    disclaimers: [],
    variantSeeds: [
      { label: '150ml', price: 13, discountPct: 20 },
      { label: '300ml', price: 21, discountPct: 15 },
    ],
    rating: { average: 4.5, totalCount: 384 },
    imageCount: 4,
  },
  {
    title: 'Glycolic Acid Smoothing Peel',
    categoryId: SKINCARE_ID,
    vendorIdx: 2,
    description:
      'Weekly 10% glycolic acid peel pads that slough dead skin and reveal a brighter complexion.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: ['Water', 'Glycolic Acid', 'Aloe Vera', 'Green Tea Extract'],
    },
    disclaimers: [{ name: 'Weekly use', title: 'Use once a week and avoid the eye area.' }],
    variantSeeds: [{ label: '30 pads', price: 23, discountPct: 20 }],
    rating: { average: 4.2, totalCount: 167 },
    imageCount: 3,
  },
  {
    title: 'Lip Repair Balm',
    categoryId: SKINCARE_ID,
    vendorIdx: 0,
    description:
      'Overnight balm with shea butter, jojoba oil, and vitamin E that repairs dry, cracked lips.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: ['Shea Butter', 'Jojoba Oil', 'Beeswax', 'Vitamin E'],
    },
    disclaimers: [],
    variantSeeds: [
      { label: '10ml', price: 6, discountPct: 20 },
      { label: '20ml', price: 10, discountPct: 15 },
    ],
    rating: { average: 4.7, totalCount: 268 },
    imageCount: 4,
  },
  {
    title: 'Cucumber Cooling Face Mist',
    categoryId: SKINCARE_ID,
    vendorIdx: 1,
    description:
      'Refreshing cucumber and green tea face mist that cools, hydrates, and sets makeup on the go.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: ['Cucumber Extract', 'Green Tea', 'Water', 'Glycerin'],
    },
    disclaimers: [],
    variantSeeds: [{ label: '100ml', price: 9, discountPct: 20 }],
    rating: { average: 4.0, totalCount: 88 },
    imageCount: 3,
  },
  {
    title: 'Tea Tree Balancing Cleanser',
    categoryId: SKINCARE_ID,
    vendorIdx: 2,
    description:
      'Purifying cleanser with tea tree oil and salicylic acid that clears blemishes and controls shine.',
    inStock: true,
    ingredients: {
      isIngredients: true,
      items: ['Water', 'Tea Tree Oil', 'Salicylic Acid', 'Aloe Vera', 'Niacinamide'],
    },
    disclaimers: [],
    variantSeeds: [
      { label: '150ml', price: 14, discountPct: 20 },
      { label: '300ml', price: 23, discountPct: 15 },
    ],
    rating: { average: 4.3, totalCount: 195 },
    imageCount: 4,
  },
];

const ASSETS_DIR = resolve(import.meta.dir, 'seed-assets');
await mkdir(ASSETS_DIR, { recursive: true });

async function ensureDownloaded(photoId: string, filePath: string): Promise<void> {
  try {
    await readFile(filePath);
  } catch {
    await mkdir(resolve(filePath, '..'), { recursive: true });
    const url = `https://images.unsplash.com/photo-${photoId}?w=800&q=80&fm=jpg`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${photoId}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const { writeFile } = await import('node:fs/promises');
    await writeFile(filePath, buf);
  }
}

function buildStoredFiles(): { photoId: string; path: string; productIdx: number; imgN: number }[] {
  const files: { photoId: string; path: string; productIdx: number; imgN: number }[] = [];
  let poolIdx = 0;
  PRODUCTS.forEach((p, pi) => {
    const slug = slugify(p.title);
    for (let n = 1; n <= p.imageCount; n++) {
      files.push({
        photoId: IMAGE_POOL[poolIdx % IMAGE_POOL.length],
        path: resolve(ASSETS_DIR, slug, `img-${n}.jpg`),
        productIdx: pi,
        imgN: n,
      });
      poolIdx++;
    }
  });
  return files;
}

console.log('\n[seed-all] ── Step 3: Products + Variants ──');

const adapter = new CloudinaryAdapter(loadCloudinaryConfig());
const storedFiles = buildStoredFiles();
console.log(`  downloading ${storedFiles.length} images (skips cached)...`);
await runPool(
  storedFiles.map((f) => async () => {
    try {
      await ensureDownloaded(f.photoId, f.path);
    } catch (e: any) {
      console.warn(`  WARN download ${f.photoId}: ${e.message}`);
    }
  }),
  6,
);

const prodStats = { created: 0, skipped: 0, variants: 0, images: 0, errors: 0 };

for (const seed of PRODUCTS) {
  const exists = await ProductModel.exists({
    title: { $regex: `^${escapeRegExp(seed.title)}$`, $options: 'i' },
  });
  if (exists) {
    console.log(`  SKIP  "${seed.title}"`);
    prodStats.skipped++;
    continue;
  }

  const slug = slugify(seed.title);
  const images: { url: string; alt: string; default: boolean; imageKey: string }[] = [];

  for (let n = 1; n <= seed.imageCount; n++) {
    const filePath = resolve(ASSETS_DIR, slug, `img-${n}.jpg`);
    try {
      const bytes = await readFile(filePath);
      const stored = await adapter.upload(ImageSource.fromBytes(bytes, 'image/jpeg'), {
        folder: ['products', slug],
        fileName: `img-${n}`,
        overwrite: true,
        access: 'public',
      });
      images.push({
        url: stored.publicUrl,
        alt: seed.title,
        default: n === 1,
        imageKey: stored.key.value,
      });
      prodStats.images++;
    } catch (e: any) {
      console.warn(`  WARN image ${n} for "${seed.title}": ${e.message}`);
    }
  }

  if (images.length === 0) {
    console.warn(`  ERROR "${seed.title}" has no images — skipped`);
    prodStats.errors++;
    continue;
  }

  const variantDocs = seed.variantSeeds.map((v) => {
    const discountedPrice = roundMoney(v.price * (1 - v.discountPct / 100));
    return {
      _id: uid(),
      productId: 'PENDING',
      price: v.price,
      discountedPrice,
      title: `${seed.title} — ${v.label}`,
      deleted: { deleted: false, deletedFrom: null, deletedBy: null, reason: null },
      version: 1,
      active: true,
    };
  });

  const prices = variantDocs.map((v) => v.price);
  const discountedPrices = variantDocs.map((v) => v.discountedPrice);

  const productId = uid();
  const productDoc = {
    _id: productId,
    categoryId: seed.categoryId,
    vendorId: VENDOR_IDS[seed.vendorIdx],
    vendorTitle: VENDOR_TITLES[seed.vendorIdx],
    title: seed.title,
    description: seed.description,
    inStock: seed.inStock,
    appearance: 'public',
    ingredient: {
      isIngredients: seed.ingredients.isIngredients,
      ingredients: seed.ingredients.items,
    },
    disclaimer: {
      isDisclaimer: seed.disclaimers.length > 0,
      disclaimers: seed.disclaimers,
    },
    image: { images },
    price: {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      minDiscountedPrice: Math.min(...discountedPrices),
      maxDiscountedPrice: Math.max(...discountedPrices),
    },
    rating: seed.rating,
    block: { blocked: false, blockedFrom: null, blockedBy: null, reason: null },
    deleted: { deleted: false, deletedFrom: null, deletedBy: null, reason: null },
    version: 1,
  };

  const finalVariants = variantDocs.map((v) => ({ ...v, productId }));

  await ProductModel.create(productDoc);
  await ProductVariantModel.insertMany(finalVariants);

  console.log(`  CREATE "${seed.title}" (${images.length} imgs, ${finalVariants.length} variants)`);
  prodStats.created++;
  prodStats.variants += finalVariants.length;
}

console.log(
  `  → ${prodStats.created} created, ${prodStats.skipped} skipped, ${prodStats.variants} variants, ${prodStats.images} images`,
);

// ─── 4. HOME LAYOUT ───────────────────────────────────────────────────────────

console.log('\n[seed-all] ── Step 4: Home Layout ──');

// Use first product images for slides/promos (fetched fresh from DB)
const sampleProducts = await ProductModel.find({ appearance: 'public' }).limit(8).lean();
const imgOf = (idx: number) => sampleProducts[idx]?.image?.images?.[0]?.url ?? HAIRCARE_IMG;

const homePayload = {
  _id: 'home-main',
  slides: [
    {
      id: uid(),
      tag: 'New Arrival',
      title: 'Hydrate & Shine — Luxury Haircare',
      subhead: 'Professional salon results at home',
      subtitle: 'Infused with argan oil, keratin & silk proteins',
      cta: 'Shop Haircare',
      image: imgOf(0),
      accent: '#7c3aed',
      displayOrder: 0,
    },
    {
      id: uid(),
      tag: 'Best Seller',
      title: 'Radiant Skin — Science-Backed Skincare',
      subhead: 'Clinically tested formulas',
      subtitle: 'Vitamin C, hyaluronic acid & niacinamide blends',
      cta: 'Shop Skincare',
      image: imgOf(4),
      accent: '#db2777',
      displayOrder: 1,
    },
    {
      id: uid(),
      tag: "Editor's Pick",
      title: 'Repair & Restore — Deep Conditioning',
      subhead: 'Strengthen from root to tip',
      subtitle: 'Keratin bond technology for frizz-free results',
      cta: 'Explore Now',
      image: imgOf(1),
      accent: '#0891b2',
      displayOrder: 2,
    },
    {
      id: uid(),
      tag: 'Flash Sale',
      title: 'Cleanse & Glow — Tea Tree Collection',
      subhead: 'Up to 20% off this week',
      subtitle: 'Purify pores, balance oil, unlock your glow',
      cta: 'Grab the Deal',
      image: imgOf(6),
      accent: '#16a34a',
      displayOrder: 3,
    },
  ],
  promos: [
    {
      id: uid(),
      title: 'Haircare Essentials',
      subtitle: 'Shampoos, masks & oils — all in one place.',
      image: imgOf(2),
      accent: '#7c3aed',
      link: `http://localhost:3000/client/categories?categoryId=${HAIRCARE_ID}`,
    },
    {
      id: uid(),
      title: 'Skincare Favourites',
      subtitle: 'Serums, moisturisers & cleansers for every skin type.',
      image: imgOf(5),
      accent: '#db2777',
      link: `http://localhost:3000/client/categories?categoryId=${SKINCARE_ID}`,
    },
    {
      id: uid(),
      title: 'Nourish Your Scalp',
      subtitle: 'Scalp cleansers and treatments for healthy roots.',
      image: imgOf(3),
      accent: '#0891b2',
      link: `http://localhost:3000/client/categories?categoryId=${HAIRCARE_ID}`,
    },
    {
      id: uid(),
      title: 'Glow Starter Kit',
      subtitle: 'Everything you need to start a skincare routine.',
      image: imgOf(7),
      accent: '#ea580c',
      link: `http://localhost:3000/client/categories?categoryId=${SKINCARE_ID}`,
    },
  ],
  categories: [
    { id: uid(), name: 'Haircare', image: HAIRCARE_IMG, accent: '#7c3aed', icon: 'Sparkles' },
    { id: uid(), name: 'Skincare', image: SKINCARE_IMG, accent: '#db2777', icon: 'Star' },
  ],
  features: [
    {
      id: uid(),
      title: 'Free Shipping',
      detail: 'On all orders above $35. Fast & reliable delivery to your door.',
      accent: '#7c3aed',
      icon: 'Truck',
    },
    {
      id: uid(),
      title: 'Cruelty-Free',
      detail: 'Every product is ethically sourced and never tested on animals.',
      accent: '#16a34a',
      icon: 'Heart',
    },
    {
      id: uid(),
      title: 'Dermatologist Approved',
      detail: 'Formulas reviewed and approved by certified dermatologists.',
      accent: '#0891b2',
      icon: 'ShieldCheck',
    },
    {
      id: uid(),
      title: '30-Day Returns',
      detail: 'Not satisfied? Return within 30 days for a full, hassle-free refund.',
      accent: '#ea580c',
      icon: 'RotateCcw',
    },
  ],
  productContainers: [
    {
      id: uid(),
      heading: 'Trending in Haircare',
      subTitle: 'Top-rated shampoos, conditioners & treatments',
      query: {
        filter: { categoryId: HAIRCARE_ID, appearance: 'public' },
        cursor: null,
        limit: 12,
        direction: 'next',
        sort: { 'stats.viewCount': -1 },
      },
      displayOrder: 0,
    },
    {
      id: uid(),
      heading: 'Best Skincare Picks',
      subTitle: 'Serums, moisturisers & cleansers your skin will love',
      query: {
        filter: { categoryId: SKINCARE_ID, appearance: 'public' },
        cursor: null,
        limit: 12,
        direction: 'next',
        sort: { 'stats.viewCount': -1 },
      },
      displayOrder: 1,
    },
    {
      id: uid(),
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

await HomeModel.findByIdAndUpdate('home-main', homePayload, { upsert: true, overwrite: true });
console.log('  → home layout upserted (4 slides, 4 promos, 2 categories, 4 features, 3 shelves)');

// ─── Summary ──────────────────────────────────────────────────────────────────

const finalCounts = {
  categories: await db.collection('categories').countDocuments(),
  vendors: await db.collection('vendors').countDocuments(),
  products: await db.collection('products').countDocuments(),
  productvariants: await db.collection('productvariants').countDocuments(),
  homes: await db.collection('homes').countDocuments(),
};

console.log('\n[seed-all] ══ Done ══════════════════════════════');
console.log(`  categories:      ${finalCounts.categories}`);
console.log(`  vendors:         ${finalCounts.vendors}`);
console.log(`  products:        ${finalCounts.products}`);
console.log(`  productvariants: ${finalCounts.productvariants}`);
console.log(`  homes:           ${finalCounts.homes}`);
console.log('════════════════════════════════════════════════');

await mongoose.disconnect();
