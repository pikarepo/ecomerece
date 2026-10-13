import mongoose, { type HydratedDocument, type InferSchemaType, Schema } from 'mongoose';

// --- Home Sub-Schemas ---
const homeCategorySchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    accent: { type: String, required: true },
    icon: { type: String, default: 'Box' },
    imageKey: { type: String },
  },
  { _id: false },
);

const homeFeatureSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    detail: { type: String, required: true },
    accent: { type: String, required: true },
    icon: { type: String, default: 'Sparkles' },
  },
  { _id: false },
);

const homeSlideSchema = new Schema(
  {
    id: { type: String, required: true },
    tag: { type: String, required: true },
    title: { type: String, required: true },
    subhead: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    cta: { type: String, required: true },
    image: { type: String, required: true },
    accent: { type: String, required: true },
    displayOrder: { type: Number, default: 0 },
    imageKey: { type: String },
  },
  { _id: false },
);

const homePromoSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, unique: true },
    subtitle: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    accent: { type: String, required: true },
    link: { type: String, default: 'https://example.com/client/home' },
    imageKey: { type: String },
  },
  { _id: false },
);

const baseQuerySchema = new Schema(
  {
    filter: { type: Schema.Types.Mixed, default: {} },
    cursor: { type: String, default: null },
    limit: { type: Number, default: 20 },
    direction: { type: String, enum: ['next', 'prev'], default: 'next' },
    sort: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false },
);

const productContainerSchema = new Schema(
  {
    id: { type: String, required: true },
    heading: { type: String, required: true },
    subTitle: { type: String, default: '' },
    query: { type: baseQuerySchema, required: true },
    displayOrder: { type: Number, required: true },
  },
  { _id: false },
);

// --- Root Home Aggregate Schema ---
export const HomeSchema = new Schema(
  {
    _id: { type: String, required: true },
    categories: { type: [homeCategorySchema], default: [] },
    features: { type: [homeFeatureSchema], default: [] },
    slides: { type: [homeSlideSchema], default: [] },
    promos: { type: [homePromoSchema], default: [] },
    productContainers: { type: [productContainerSchema], default: [] },
    version: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    versionKey: false,
  },
);

export type HomePersistence = InferSchemaType<typeof HomeSchema>;
export type HomeDocument = HydratedDocument<HomePersistence>;
export const HomeModel = mongoose.model<HomePersistence>('Home', HomeSchema);
