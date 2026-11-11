import { z } from 'zod';
import { descriptionSchema } from '../../dtos';

export const addVendorReplyDto = z.object({
  reply: descriptionSchema,
});

export type addVendorReplyDtoType = z.infer<typeof addVendorReplyDto>;
