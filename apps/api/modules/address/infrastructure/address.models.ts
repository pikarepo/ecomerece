import mongoose, { type HydratedDocument, type InferSchemaType, Schema } from 'mongoose';

const deletedSchema = new Schema(
  {
    deleted: { type: Boolean, default: false, required: true },
    deletedFrom: { type: Date, default: null },
    deletedBy: { type: String, default: null },
    reason: { type: String, default: null },
  },
  { _id: false },
);
export const AddressSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    ownerId: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    streetAddress: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,

      trim: true,
    },
    state: {
      type: String,
      required: true,

      trim: true,
    },
    defaultDate: {
      type: Date,
    },
    postalCode: {
      type: String,
      required: true,

      trim: true,
    },
    country: {
      type: String,
      required: true,

      trim: true,
    },
    fullAddress: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      default: 0,
    },

    deleted: {
      type: deletedSchema,
      required: true,
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

export type AddressPersistence = InferSchemaType<typeof AddressSchema>;
export type AddressDocument = HydratedDocument<AddressPersistence>;
export const AddressModel = mongoose.model<AddressPersistence>('Address', AddressSchema);
