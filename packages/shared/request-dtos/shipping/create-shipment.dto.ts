import { z } from 'zod';
import { idSchema } from '../../dtos';

/** Mirrors the domain allow-lists; keeping them here lets the SDK validate first. */
export const shipmentCarrierValues = ['dhl', 'fedex', 'ups', 'tcs', 'leopards', 'local'] as const;
export const shipmentMethodValues = ['standard', 'express', 'overnight', 'same_day'] as const;
export const shipmentStatusValues = [
  'pending',
  'dispatched',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'failed',
  'returned',
  'cancelled',
] as const;

export const createShipmentDto = z.object({
  orderId: idSchema,
  /** Admin only: required when the order spans several vendors. */
  vendorId: idSchema.optional(),
  carrier: z.enum(shipmentCarrierValues, { message: 'Carrier is not supported' }),
  shippingMethod: z.enum(shipmentMethodValues, { message: 'Shipping method is not supported' }),
  cost: z.number({ message: 'Cost must be a number' }).min(0, 'Cost cannot be negative'),
  weightGrams: z
    .number({ message: 'Weight must be a number' })
    .int('Weight must be whole grams')
    .min(1, 'Weight must be at least 1 gram'),
  estimatedDelivery: z.coerce.date({ message: 'Estimated delivery must be a date' }).optional(),
});

export type createShipmentDtoType = z.infer<typeof createShipmentDto>;
