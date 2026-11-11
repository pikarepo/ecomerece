import type { AddressInternalService } from '../address.app.internal.service';
import type {
  GetAddressesByOwnerIdQuery,
  GetAddressesByOwnerIdResult,
} from '../queries/get-addresses-by-owner-id.query';

export class GetAddressesByOwnerIdHandler {
  readonly type = 'GetAddressesByOwnerIdQuery';
  constructor(private readonly internalService: AddressInternalService) {}

  async handle(query: GetAddressesByOwnerIdQuery): Promise<GetAddressesByOwnerIdResult> {
    return await this.internalService.getAddressesByOwnerId(query.payload.ownerId);
  }
}
