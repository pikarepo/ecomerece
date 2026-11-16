import mongoose, { type HydratedDocument, Schema } from 'mongoose';

const deletedSchema = new mongoose.Schema(
  {
    deleted: { type: Boolean, default: false, required: true },
    deletedFrom: { type: Date, default: null },
    deletedBy: { type: String, default: null },
    reason: { type: String, default: null },
  },
  { _id: false },
);

const NotificationModelSchema = new Schema(
  {
    _id: { type: String, required: true },

    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      required: true,
      index: true,
      enum: ['order', 'shipment', 'return', 'account', 'system'],
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    referenceId: { type: String, default: null },

    isRead: { type: Boolean, required: true, default: false, index: true },
    readAt: { type: Date, default: null },

    version: { type: Number, required: true, default: 0 },
    deleted: { type: deletedSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

// The inbox query is always "my unread/read rows, newest first".
NotificationModelSchema.index({ userId: 1, isRead: 1, _id: -1 });

export interface NotificationPersistence {
  _id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  referenceId: string | null;
  isRead: boolean;
  readAt: Date | null;
  version: number;
  deleted: {
    deleted: boolean;
    deletedFrom?: Date | null;
    deletedBy?: string | null;
    reason?: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationDocument = HydratedDocument<NotificationPersistence>;
export const NotificationModel = mongoose.model<NotificationPersistence>(
  'Notification',
  NotificationModelSchema,
);
