import { z } from 'zod';
import { shipmentCarrierValues, shipmentMethodValues } from './create-shipment.dto';

/** Label details can be corrected until the parcel reaches a final state. */
export const assignTrackingDto = z.object({
  carrier: z.enum(shipmentCarrierValues, { message: 'Carrier is not supported' }),
  shippingMethod: z.enum(shipmentMethodValues, { message: 'Shipping method is not supported' }),
  trackingNumber: z
    .string({ message: 'Tracking number must be a string' })
    .trim()
    .regex(
      /^[A-Za-z0-9-]{6,40}$/,
      'Tracking number must be 6-40 characters of letters, digits or hyphens',
    ),
  cost: z.number({ message: 'Cost must be a number' }).min(0, 'Cost cannot be negative'),
  estimatedDelivery: z.coerce.date({ message: 'Estimated delivery must be a date' }).optional(),
});

export type assignTrackingDtoType = z.infer<typeof assignTrackingDto>;
