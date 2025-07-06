import 'reflect-metadata';
import { container } from 'tsyringe';
import { EventBus } from '@shared/bus/EventBus';
import { InMemoryEventBus } from '@infra/bus/InMemoryEventBus';
import { TokenServicePort } from '@auth/application/ports/token-service.port';
import { JwtTokenService } from '@auth/infrastructure/services/jwt-token.service';
import { HashServicePort } from '@auth/application/ports/hash-service.port';
import { BcryptHashService } from '@auth/infrastructure/services/bcrypt-hash.service';

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

export { container };
