import mongoose, { type HydratedDocument, Schema } from 'mongoose';

const deletedSchema = new Schema(
  {
    deleted: { type: Boolean, default: false, required: true },
    deletedFrom: { type: Date, default: null },
    deletedBy: { type: String, default: null },
    reason: { type: String, default: null },
  },
  { _id: false },
);

const transactionSchema = new Schema(
  {
    type: { type: String, required: true, enum: ['authorization', 'capture', 'refund', 'void'] },
    amount: { type: Number, required: true, min: 0 },
    providerRef: { type: String, default: null },
    reason: { type: String, default: null },
    occurredAt: { type: Date, required: true },
  },
  { _id: false },
);

const PaymentModelSchema = new Schema(
  {
    _id: { type: String, required: true },
    orderId: { type: String, required: true, index: true },
    buyerId: { type: String, required: true, index: true },
    provider: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    capturedAmount: { type: Number, required: true, default: 0, min: 0 },
    refundedAmount: { type: Number, required: true, default: 0, min: 0 },
    currency: { type: String, required: true, default: 'USD' },
    status: {
      type: String,
      required: true,
      index: true,
      enum: [
        'pending',
        'authorized',
        'captured',
        'failed',
        'cancelled',
        'refunded',
        'partially_refunded',
      ],
    },
    providerRef: { type: String, default: null, index: true },
    transactions: { type: [transactionSchema], default: [] },
    version: { type: Number, required: true, default: 0 },
    deleted: { type: deletedSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

PaymentModelSchema.index({ buyerId: 1, _id: -1 });

export interface PaymentTransactionPersistence {
  type: string;
  amount: number;
  providerRef: string | null;
  reason: string | null;
  occurredAt: Date;
}

export interface PaymentPersistence {
  _id: string;
  orderId: string;
  buyerId: string;
  provider: string;
  amount: number;
  capturedAmount: number;
  refundedAmount: number;
  currency: string;
  status: string;
  providerRef: string | null;
  transactions: PaymentTransactionPersistence[];
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

export type PaymentDocument = HydratedDocument<PaymentPersistence>;
export const PaymentModel = mongoose.model<PaymentPersistence>('Payment', PaymentModelSchema);
