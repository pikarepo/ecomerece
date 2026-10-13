/**
 * Seed script: insert base data — categories and vendors.
 * Safe to re-run: skips any document whose _id already exists.
 *
 * Run from repo root:
 *   bun run apps/api/scripts/seed-base-data.ts
 */

import { resolve } from 'node:path';
import { config } from 'dotenv';

config({ path: resolve(import.meta.dir, '../.env') });

const { connectDB } = await import('../lib/mongo');
const { default: mongoose } = await import('mongoose');

await connectDB();
console.log('[base-seed] connected to MongoDB');

const db = mongoose.connection.db!;
const now = new Date();

// ─── Categories ───────────────────────────────────────────────────────────────

const categories = [
  {
    _id: '01a0a4ba-6660-714e-a85d-e95b3d442fb2',
    title: 'Haircare',
    image:
      'https://res.cloudinary.com/ezabelpf/image/upload/v1789470076/categories/0f43de91-c410-4ad2-8c72-b7e6ef8c147e.jpg',
    createdBy: 'system',
    version: 0,
    block: { blocked: false, blockedFrom: null, blockedBy: null, reason: null },
    deleted: { deleted: false, deletedFrom: null, deletedBy: null, reason: null },
    imageKey: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: '01a0a516-1c89-7123-8db2-4c0a66facf82',
    title: 'Skincare',
    image:
      'https://res.cloudinary.com/ezabelpf/image/upload/v1789476085/categories/e544f969-3e36-4a98-bf19-a18256470449.jpg',
    createdBy: 'system',
    version: 0,
    block: { blocked: false, blockedFrom: null, blockedBy: null, reason: null },
    deleted: { deleted: false, deletedFrom: null, deletedBy: null, reason: null },
    imageKey: null,
    createdAt: now,
    updatedAt: now,
  },
];

let catInserted = 0;
for (const cat of categories) {
  const exists = await db.collection('categories').findOne({ _id: cat._id as any });
  if (exists) {
    console.log(`[base-seed] SKIP category "${cat.title}" (already exists)`);
  } else {
    await db.collection('categories').insertOne(cat as any);
    console.log(`[base-seed] CREATED category "${cat.title}"`);
    catInserted++;
  }
}

// ─── Vendors ──────────────────────────────────────────────────────────────────

const vendors = [
  {
    _id: '01a09f82-cd47-7621-81e2-b40a319d4996',
    ownerId: '01a09f82-0000-7000-0000-000000000001',
    title: 'Tech Hub Plus',
    slug: 'tech-hub-plus',
    description: 'Premium beauty and personal care products for the modern consumer.',
    images: {
      logo: 'https://res.cloudinary.com/ezabelpf/image/upload/v1789470076/categories/0f43de91-c410-4ad2-8c72-b7e6ef8c147e.jpg',
      banner:
        'https://res.cloudinary.com/ezabelpf/image/upload/v1789470076/categories/0f43de91-c410-4ad2-8c72-b7e6ef8c147e.jpg',
      logoKey: null,
      bannerKey: null,
    },
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
    _id: '01a09f85-4bdc-767a-83dc-db90e852c94a',
    ownerId: '01a09f85-0000-7000-0000-000000000002',
    title: 'Sunrise Electronics',
    slug: 'sunrise-electronics',
    description: 'Trusted source for professional-grade hair and skin treatments.',
    images: {
      logo: 'https://res.cloudinary.com/ezabelpf/image/upload/v1789476085/categories/e544f969-3e36-4a98-bf19-a18256470449.jpg',
      banner:
        'https://res.cloudinary.com/ezabelpf/image/upload/v1789476085/categories/e544f969-3e36-4a98-bf19-a18256470449.jpg',
      logoKey: null,
      bannerKey: null,
    },
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
    _id: '01a09f87-ec73-7533-bf05-306d7bd4cda0',
    ownerId: '01a09f87-0000-7000-0000-000000000003',
    title: 'Green Leaf Grocery',
    slug: 'green-leaf-grocery',
    description: 'Natural and organic beauty essentials, sourced sustainably.',
    images: {
      logo: 'https://res.cloudinary.com/ezabelpf/image/upload/v1789470076/categories/0f43de91-c410-4ad2-8c72-b7e6ef8c147e.jpg',
      banner:
        'https://res.cloudinary.com/ezabelpf/image/upload/v1789470076/categories/0f43de91-c410-4ad2-8c72-b7e6ef8c147e.jpg',
      logoKey: null,
      bannerKey: null,
    },
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

let vendorInserted = 0;
for (const vendor of vendors) {
  const exists = await db.collection('vendors').findOne({ _id: vendor._id as any });
  if (exists) {
    console.log(`[base-seed] SKIP vendor "${vendor.title}" (already exists)`);
  } else {
    await db.collection('vendors').insertOne(vendor as any);
    console.log(`[base-seed] CREATED vendor "${vendor.title}"`);
    vendorInserted++;
  }
}

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log('---------------------------------------------');
console.log('[base-seed] done');
console.log(`  categories inserted: ${catInserted}`);
console.log(`  vendors inserted:    ${vendorInserted}`);
console.log('---------------------------------------------');

await mongoose.disconnect();
