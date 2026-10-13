export type ReviewReadModel = {
  _id: string;
  productId: string;
  authorId: string;
  orderId: string | null;
  authorName: string;
  authorAvatar: string;
  reportCount: number;
  reportReasons: string[];
  rating: number;
  title: string;
  dislikes: number;
  likes: number;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  vendorReply: string | null;
  deleted: {
    deleted: boolean;
    deletedFrom: Date | null;
    deletedBy: string | null;
    reason: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
};
