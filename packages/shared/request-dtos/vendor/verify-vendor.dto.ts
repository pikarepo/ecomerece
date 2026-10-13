import { z } from 'zod';

export const VerifyVendorDtoSchema = z.object({
  vendorId: z.uuidv7({ message: 'Must be a valid vendor ID' }),
});

export type VerifyVendorDto = z.infer<typeof VerifyVendorDtoSchema>;
