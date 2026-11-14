import { z } from 'zod';

export const updateVendorStatsRefreshSchema = z.object({
  enabled: z.boolean({ message: 'enabled must be a boolean' }),
});

export type UpdateVendorStatsRefreshDto = z.infer<typeof updateVendorStatsRefreshSchema>;
