import { BadRequestError } from '../../../errors/app-error';
import { Money, Quantity } from '../../../value-objects';

export class VendorStatsVO {
  private constructor(
    readonly totalSales: Money,
    readonly totalOrders: Quantity,
    readonly completedOrders: Quantity,
    readonly cancelledOrders: Quantity,
    readonly returnedOrders: Quantity,
    readonly refundedOrders: Quantity,
    readonly totalProducts: Quantity,
    readonly rating: number,
    readonly totalReviews: Quantity,
  ) {}

  static none(): VendorStatsVO {
    return new VendorStatsVO(
      new Money(0),
      new Quantity(0),
      new Quantity(0),
      new Quantity(0),
      new Quantity(0),
      new Quantity(0),
      new Quantity(0),
      0,
      new Quantity(0),
    );
  }

  static rehydrate(
    totalSales: Money,
    totalOrders: Quantity,
    completedOrders: Quantity,
    cancelledOrders: Quantity,
    returnedOrders: Quantity,
    refundedOrders: Quantity,
    totalProducts: Quantity,
    rating: number,
    totalReviews: Quantity,
  ): VendorStatsVO {
    VendorStatsVO.validate(rating);

    return new VendorStatsVO(
      totalSales,
      totalOrders,
      completedOrders,
      cancelledOrders,
      returnedOrders,
      refundedOrders,
      totalProducts,
      rating,
      totalReviews,
    );
  }

  addSale(amount: Money): VendorStatsVO {
    return new VendorStatsVO(
      this.totalSales.addMoney(amount),
      this.totalOrders,
      this.completedOrders,
      this.cancelledOrders,
      this.returnedOrders,
      this.refundedOrders,
      this.totalProducts,
      this.rating,
      this.totalReviews,
    );
  }
  removeSale(amount: Money): VendorStatsVO {
    return new VendorStatsVO(
      this.totalSales.subtractMoney(amount),
      this.totalOrders,
      this.completedOrders,
      this.cancelledOrders,
      this.returnedOrders,
      this.refundedOrders,
      this.totalProducts,
      this.rating,
      this.totalReviews,
    );
  }
  addOrder(quantity: number): VendorStatsVO {
    return new VendorStatsVO(
      this.totalSales,
      this.totalOrders.increase(quantity),
      this.completedOrders,
      this.cancelledOrders,
      this.returnedOrders,
      this.refundedOrders,
      this.totalProducts,
      this.rating,
      this.totalReviews,
    );
  }
  addCompletedOrder(quantity: number): VendorStatsVO {
    return new VendorStatsVO(
      this.totalSales,
      this.totalOrders,
      this.completedOrders.increase(quantity),
      this.cancelledOrders,
      this.returnedOrders,
      this.refundedOrders,
      this.totalProducts,
      this.rating,
      this.totalReviews,
    );
  }
  addCancelledOrder(quantity: number): VendorStatsVO {
    return new VendorStatsVO(
      this.totalSales,
      this.totalOrders,
      this.completedOrders,
      this.cancelledOrders.increase(quantity),
      this.returnedOrders,
      this.refundedOrders,
      this.totalProducts,
      this.rating,
      this.totalReviews,
    );
  }
  addReturnedOrder(quantity: number): VendorStatsVO {
    return new VendorStatsVO(
      this.totalSales,
      this.totalOrders,
      this.completedOrders,
      this.cancelledOrders,
      this.returnedOrders.increase(quantity),
      this.refundedOrders,
      this.totalProducts,
      this.rating,
      this.totalReviews,
    );
  }
  addRefundedOrder(quantity: number): VendorStatsVO {
    return new VendorStatsVO(
      this.totalSales,
      this.totalOrders,
      this.completedOrders,
      this.cancelledOrders,
      this.returnedOrders,
      this.refundedOrders.increase(quantity),
      this.totalProducts,
      this.rating,
      this.totalReviews,
    );
  }
  addProduct(quantity: number): VendorStatsVO {
    return new VendorStatsVO(
      this.totalSales,
      this.totalOrders,
      this.completedOrders,
      this.cancelledOrders,
      this.returnedOrders,
      this.refundedOrders,
      this.totalProducts.increase(quantity),
      this.rating,
      this.totalReviews,
    );
  }

  removeProduct(quantity: number): VendorStatsVO {
    return new VendorStatsVO(
      this.totalSales,
      this.totalOrders,
      this.completedOrders,
      this.cancelledOrders,
      this.returnedOrders,
      this.refundedOrders,
      this.totalProducts.decrease(quantity),
      this.rating,
      this.totalReviews,
    );
  }

  addReview(score: number): VendorStatsVO {
    VendorStatsVO.validate(score);

    const reviewCount = this.totalReviews.value + 1;

    const average = (this.rating * this.totalReviews.value + score) / reviewCount;

    return new VendorStatsVO(
      this.totalSales,
      this.totalOrders,
      this.completedOrders,
      this.cancelledOrders,
      this.returnedOrders,
      this.refundedOrders,
      this.totalProducts,
      Number(average.toFixed(2)),
      this.totalReviews.increase(1),
    );
  }

  removeReview(score: number): VendorStatsVO {
    VendorStatsVO.validate(score);

    if (this.totalReviews.value === 1) {
      return new VendorStatsVO(
        this.totalSales,
        this.totalOrders,
        this.completedOrders,
        this.cancelledOrders,
        this.returnedOrders,
        this.refundedOrders,
        this.totalProducts,
        0,
        new Quantity(0),
      );
    }

    const reviewCount = this.totalReviews.value - 1;

    const average = (this.rating * this.totalReviews.value - score) / reviewCount;

    return new VendorStatsVO(
      this.totalSales,
      this.totalOrders,
      this.completedOrders,
      this.cancelledOrders,
      this.returnedOrders,
      this.refundedOrders,
      this.totalProducts,
      Number(average.toFixed(2)),
      this.totalReviews.decrease(1),
    );
  }

  private static validate(rating: number): void {
    if (rating < 0 || rating > 5) {
      throw new BadRequestError('Rating must be between 0 and 5.');
    }
  }
}
