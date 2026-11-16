import { z } from 'zod';

export const notificationTypeValues = ['order', 'shipment', 'return', 'account', 'system'] as const;

export const getMyNotificationsQuerySchema = z.object({
  type: z
    .enum(notificationTypeValues, { message: 'Type must be a valid notification type' })
    .optional(),
  isRead: z.coerce.boolean({ message: 'isRead must be a boolean' }).optional(),
  cursor: z.string({ message: 'Cursor must be a string' }).optional(),
  limit: z.coerce
    .number({ message: 'Limit must be a number' })
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must not exceed 100')
    .optional()
    .default(20),
  direction: z
    .enum(['next', 'prev'], { message: 'Direction must be either next or prev' })
    .optional()
    .default('next'),
});

export type GetMyNotificationsQueryDto = z.infer<typeof getMyNotificationsQuerySchema>;
