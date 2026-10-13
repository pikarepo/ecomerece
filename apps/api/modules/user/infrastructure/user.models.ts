import mongoose, { type HydratedDocument, type InferSchemaType } from 'mongoose';

const nameSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String, default: null },
    lastName: { type: String, default: null },
    fullName: { type: String, required: true },
  },
  { _id: false },
);

const roleSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['customer', 'vendor', 'admin'],
      default: 'customer',
      required: true,
    },
    reason: { type: String, default: null },
    from: { type: Date, default: null },
    assignedBy: { type: String, default: null },
  },
  { _id: false },
);

const blockSchema = new mongoose.Schema(
  {
    blocked: { type: Boolean, default: false, required: true },
    blockedFrom: { type: Date, default: null },
    blockedBy: { type: String, default: null },
    reason: { type: String, default: null },
  },
  { _id: false },
);

const banSchema = new mongoose.Schema(
  {
    banned: { type: Boolean, default: false, required: true },
    from: { type: Date, default: null },
    until: { type: Date, default: null },
    bannedBy: { type: String, default: null },
    reason: { type: String, default: null },
  },
  { _id: false },
);

const deletedSchema = new mongoose.Schema(
  {
    deleted: { type: Boolean, default: false, required: true },
    deletedFrom: { type: Date, default: null },
    deletedBy: { type: String, default: null },
    reason: { type: String, default: null },
  },
  { _id: false },
);

export const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },

    version: {
      type: Number,
      required: true,
      default: 0,
    },

    name: {
      type: nameSchema,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    image: {
      type: String,
      default: '',
    },

    role: {
      type: roleSchema,
      required: true,
    },

    block: {
      type: blockSchema,
      required: true,
    },

    ban: {
      type: banSchema,
      required: true,
    },

    deleted: {
      type: deletedSchema,
      required: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },

    versionKey: false,
  },
);

export type UserPersistence = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<UserPersistence>;
export const UserModel = mongoose.model<UserPersistence>('User', userSchema);
