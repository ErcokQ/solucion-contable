import 'reflect-metadata';
import { container } from 'tsyringe';
import { EventBus } from '@shared/bus/EventBus';
import { InMemoryEventBus } from '@infra/bus/InMemoryEventBus';
import { TokenServicePort } from '@auth/application/ports/token-service.port';
import { JwtTokenService } from '@auth/infrastructure/services/jwt-token.service';
import { HashServicePort } from '@auth/application/ports/hash-service.port';
import { BcryptHashService } from '@auth/infrastructure/services/bcrypt-hash.service';
import { UserRepositoryPort } from '@auth/application/ports/user-repository.port';
import { SignInUseCase } from '@auth/application/use-cases/signIn.usecase';
import { SignupUseCase } from '@auth/application/use-cases/signup.usecase';
import { RefreshUseCase } from '@auth/application/use-cases/refresh.usecase';
import { LogoutUseCase } from '@auth/application/use-cases/logout.usecase';
import { TypeOrmUserRepository } from '@auth/infrastructure/repositories/typeorm-user.repository';
import { RoleRepositoryPort } from '@auth/application/ports/role-repository.port';
import { TypeOrmRoleRepository } from '@auth/infrastructure/repositories/typeorm-role.repository';
/**CfdiRegistro*/
import { XmlValidatorPort } from '@cfdi/application/ports/xml-validator.port';
import { XsdValidatorService } from '@cfdi/infrastructure/services/xsd-validator.service';
import { FileStoragePort } from '@cfdi/application/ports/storage.port';
import { LocalDiskStorageService } from '@cfdi/infrastructure/services/local-disk-storage.service';
import { QueueProducerPort } from '@cfdi/application/ports/queue-producer.port';
import { BullCfdiProducer } from '@cfdi/infrastructure/services/bull-cfdi-producer.service';
import { ImportCfdiUseCase } from '@cfdi/application/use-cases/import-cfdi.usecase';
import { TypeOrmCfdiRepository } from '@cfdi/infrastructure/repositories/typeorm-cfdi.repository';
import { CfdiRepositoryPort } from '@cfdi/application/ports/cfdi-repository.port';
import { BulkImportCfdiUseCase } from '@cfdi/application/use-cases/bulk-import-cfdi.usecase';
import { ListCfdiJobsUseCase } from '@cfdi/application/use-cases/list-cfdi-jobs.usecase';
import { ListCfdiUseCase } from '@cfdi/application/use-cases/list-cfdi.usecase';
import { GetCfdiDetailUseCase } from '@cfdi/application/use-cases/get-cfdi-detail.usecase';
import { GetCfdiXmlUseCase } from '@cfdi/application/use-cases/get-cfdi-xml.usecase';
import { DeleteCfdiUseCase } from '@cfdi/application/use-cases/delete-cfdi.usecase';
import { GenerateDiotReportUseCase } from '@cfdi/application/use-cases/generate-diot-report.usecase';
/**Complmento de pagos */
import { PaymentRepositoryPort } from '@payments/application/ports/payment-repository.port';
import { TypeOrmPaymentRepository } from '@payments/infrastructure/repositories/typeorm-payment.repository';
import { ListPaymentsUseCase } from '@payments/application/use-cases/payments-list.use-case';
import { GetPaymentDetailUseCase } from '@payments/application/use-cases/payments-detail.use-case';

/**Complementos de nomina */
import { ListPayrollUseCase } from '@payroll/application/use-cases/list-payroll.usecase';
import { GetPayrollDetailUseCase } from '@payroll/application/use-cases/get-payroll-detail.usecase';
import { TypeOrmPayrollRepository } from '@payroll/infrastructure/repositories/typeorm-payroll.repository';
import { PayrollRepositoryPort } from '@payroll/application/ports/payroll-repository.port';
import { ProductKeyRepositoryPort } from '@auth/application/ports/product-key-repository.port';
import { TypeOrmProductKeyRepository } from '@auth/infrastructure/repositories/typeorm-product-key.repository';

/** Summary imports */
import { SummaryRepositoryPort } from 'modules/summary/application/ports/summary-repository.port';
import { TypeOrmSummaryRepository } from 'modules/summary/infrastructure/repositories/typeorm-summary.repository';

/**Reports imports */
import { ReportsRepositoryPort } from '@reports/application/ports/cfdi-report.port';
import { TypeOrmReportsRepository } from '@reports/infrastructure/repositories/typeorm-reports.repository';
import { GenerateIvaReportUseCase } from '@reports/application/use-cases/generate-iva-report.usecase';

container.registerSingleton<EventBus>('EventBus', InMemoryEventBus);

container.registerSingleton<HashServicePort>(
  'HashServicePort',
  BcryptHashService,
);
container.registerSingleton<TokenServicePort>(
  'TokenServicePort',
  JwtTokenService,
);
container.registerSingleton<UserRepositoryPort>(
  'UserRepo',
  TypeOrmUserRepository,
);
container.registerSingleton<RoleRepositoryPort>(
  'RoleRepo',
  TypeOrmRoleRepository,
);
container.registerSingleton<ProductKeyRepositoryPort>(
  'ProductKeyRepo',
  TypeOrmProductKeyRepository,
);
/**CfdiRegistroPuertos */
container.registerSingleton<XmlValidatorPort>(
  'XmlValidator',
  XsdValidatorService,
);
container.registerSingleton<FileStoragePort>(
  'FileStorage',
  LocalDiskStorageService,
);
container.registerSingleton<QueueProducerPort>('CfdiQueue', BullCfdiProducer);
container.registerSingleton(ImportCfdiUseCase);
container.registerSingleton(BulkImportCfdiUseCase);
container.registerSingleton(ListCfdiJobsUseCase);
container.registerSingleton(ListCfdiUseCase);
container.registerSingleton(GetCfdiDetailUseCase);
container.registerSingleton(GetCfdiXmlUseCase);
container.registerSingleton(DeleteCfdiUseCase);
container.registerSingleton(GenerateDiotReportUseCase);
container.registerSingleton<CfdiRepositoryPort>(
  'CfdiRepo',
  TypeOrmCfdiRepository,
);
/**Registro de complemento de pagos */
container.registerSingleton<PaymentRepositoryPort>(
  'PaymentRepo',
  TypeOrmPaymentRepository,
);
container.registerSingleton(ListPaymentsUseCase);
container.registerSingleton(GetPaymentDetailUseCase);

/**Complementos de nomina */
container.registerSingleton<PayrollRepositoryPort>(
  'PayrollRepo',
  TypeOrmPayrollRepository,
);
container.registerSingleton(ListPayrollUseCase);
container.registerSingleton(GetPayrollDetailUseCase);

/**Registro casos de uso Auth */
container.registerSingleton(SignInUseCase);
container.registerSingleton(SignupUseCase);
container.registerSingleton(RefreshUseCase);
container.registerSingleton(LogoutUseCase);

/** Summary */
container.registerSingleton<SummaryRepositoryPort>(
  'SummaryRepo',
  TypeOrmSummaryRepository,
);

/** Reportes */
container.registerSingleton(GenerateIvaReportUseCase);
container.registerSingleton<ReportsRepositoryPort>(
  'ReportsRepo',
  TypeOrmReportsRepository,
);
container.registerSingleton<ReportsRepositoryPort>(
  'ReportsRepo',
  TypeOrmReportsRepository,
);

export { container };
