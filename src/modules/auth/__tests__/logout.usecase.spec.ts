import 'reflect-metadata';
import { LogoutUseCase } from '@auth/application/use-cases/logout.usecase';

describe('LogoutUseCase (stateless)', () => {
  it('no hace nada y resuelve', async () => {
    const uc = new LogoutUseCase();
    await expect(uc.execute({ refreshToken: 'rt' })).resolves.toBeUndefined();
  });
});
