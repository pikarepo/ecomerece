import { z } from 'zod';

export const RecoverVendorDtoSchema = z.object({
  vendorId: z.uuidv7({ message: 'Must be a valid vendor ID' }),
});

export type RecoverVendorDto = z.infer<typeof RecoverVendorDtoSchema>;
