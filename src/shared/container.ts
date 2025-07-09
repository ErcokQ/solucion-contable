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

container.register<EventBus>('EventBus', {
  useClass: InMemoryEventBus,
});

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

/**Registro casos de uso Auth */
container.registerSingleton(SignInUseCase);
container.registerSingleton(SignupUseCase);
container.registerSingleton(RefreshUseCase);
container.registerSingleton(LogoutUseCase);

export { container };
