import mongoose, { type HydratedDocument, Schema } from 'mongoose';

const PayoutSchema = new Schema(
  {
    _id: { type: String, required: true },
    vendorId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'USD' },
    status: {
      type: String,
      required: true,
      enum: ['requested', 'approved', 'processing', 'paid', 'failed', 'cancelled'],
      index: true,
    },
    method: { type: String, required: true, default: 'manual' },
    destinationRef: { type: String, default: null },
    providerRef: { type: String, default: null },
    failureReason: { type: String, default: null },
    version: { type: Number, required: true, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

const LedgerSchema = new Schema(
  {
    _id: { type: String, required: true },
    vendorId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'USD' },
    referenceType: { type: String, default: null },
    referenceId: { type: String, default: null, index: true },
    note: { type: String, default: null },
    version: { type: Number, required: true, default: 0 },
  },
  { timestamps: true, versionKey: false },
);
LedgerSchema.index({ vendorId: 1, _id: -1 });
LedgerSchema.index({ referenceType: 1, referenceId: 1, type: 1 }, { unique: true, sparse: true });

export interface PayoutPersistence {
  _id: string;
  vendorId: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  destinationRef: string | null;
  providerRef: string | null;
  failureReason: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
export interface LedgerPersistence {
  _id: string;
  vendorId: string;
  type: string;
  amount: number;
  currency: string;
  referenceType: string | null;
  referenceId: string | null;
  note: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export const PayoutModel = mongoose.model<PayoutPersistence>('Payout', PayoutSchema);
export const LedgerEntryModel = mongoose.model<LedgerPersistence>('LedgerEntry', LedgerSchema);
