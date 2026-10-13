import { commandBus } from '../../core/infrastructure/buses/in-memory-command-bus';
import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { queryBus } from '../../core/infrastructure/buses/in-memory-query-bus';
import { productVariantInternalService } from './application/product-varaint.internal.service';
import { productVariantApplicationService } from './application/product-variant.app.service';
import { EnsureActiveVariantGetByIdQuery } from './application/queries/ensure-active-variant-get-by-id.query';
import { VerifyVariantsAndGetQuery } from './application/queries/verify-variants-and-get.query';
import { EnsureActiveVariantGetByIdHandler } from './application/query-handlers/ensure-active-variant-get-by-id.query-handler';
import { VerifyVariantsAndGetHandler } from './application/query-handlers/verify-variant-and-get.query-handler';
import { ProductVariantRepository } from './infrastructure/product-variant.repository';
import { ProductVariantController } from './presentation/product-variant.controller';

export function createProductVaraintModule() {
  const repo = new ProductVariantRepository();
  const internalService = new productVariantInternalService(repo, queryBus);
  const applicationService = new productVariantApplicationService(
    repo,
    queryBus,
    commandBus,
    eventBus,
  );
  queryBus.register(
    EnsureActiveVariantGetByIdQuery,
    new EnsureActiveVariantGetByIdHandler(internalService),
  );
  queryBus.register(VerifyVariantsAndGetQuery, new VerifyVariantsAndGetHandler(internalService));
  const controller = new ProductVariantController(applicationService);
  return { repo, internalService, applicationService, controller };
}
