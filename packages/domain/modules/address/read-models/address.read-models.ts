export interface AddressReadModel {
  id: string;
  ownerId: string;
  defaultDate: Date | null;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  fullAddress: string;
  deleted: {
    deleted: boolean;
    deletedFrom: Date | null;
    deletedBy: string | null;
    reason: string | null;
  };
  createdAt: Date;
}
