import { z } from 'zod';

export const RejectVendorDtoSchema = z.object({
  vendorId: z.uuidv7({ message: 'Must be a valid vendor ID' }),
  reason: z
    .string()
    .trim()
    .min(10, 'Reason must be at least 10 characters')
    .max(1000, 'Reason must not exceed 1000 characters'),
});

export type RejectVendorDto = z.infer<typeof RejectVendorDtoSchema>;
