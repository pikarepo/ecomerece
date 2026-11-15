import type { Metrics } from '../StatTypes';

export type VendorListItemReadModel = {
  id: string;
  title: string;
  slug: string;
  stats?: Metrics;
  /** Present on the admin list so admins can render logo/banner previews. */
  images?: {
    logo: string;
    banner: string;
  };
  /** Present on the admin list so admins can render verification/delete badges. */
  verification?: {
    isVerified: boolean;
    rejectedReason: string | null;
  };
  isDeleted?: boolean;
  createdAt?: Date;
};

/**
 * Storefront view. Contact details, owner account and internal flags are
 * deliberately absent: the public only needs branding and verification state.
 */
export type VendorPublicResponseReadModel = {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: {
    logo: string;
    banner: string;
  };
  verification: {
    isVerified: boolean;
  };
};

export type VendorResponseReadModel = {
  id: string;
  ownerId: string;
  title: string;
  slug: string;
  description: string;

  images: {
    logo: string;
    banner: string;
  };

  contact: {
    phone: string;
    email: string;
    address: {
      streetAddress: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  // stats: {
  //     totalSales: number;
  //     totalOrders: number;
  //     completedOrders: number;
  //     cancelledOrders: number;
  //     returnedOrders: number;
  //     refundedOrders: number;
  //     totalProducts: number;
  //     rating: number;
  //     totalReviews: number;
  // };
  /** Denormalized lifetime metrics for the vendor, refreshed by the stats pipeline. */
  stats?: Metrics;
  verification: {
    isVerified: boolean;
    verifiedAt: Date | null;
    rejectedReason: string | null;
  };
  statsRefreshEnabled: boolean;
};
