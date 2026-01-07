// src/modules/auth/application/use-cases/signin.use-case.ts
import { injectable, inject } from 'tsyringe';
import { SignInDto } from '../dto/signin.dto';
import { UserRepositoryPort } from '../ports/user-repository.port';
import { HashServicePort } from '../ports/hash-service.port';
import { TokenServicePort } from '../ports/token-service.port';
import { ApiError } from '@shared/error/ApiError';
import { AccessTokenPayload } from '@auth/domain/types/access-token-payload.type';
import { UserAccountRepositoryPort } from '@auth/application/ports/user-account-repository.port';

@injectable()
export class SignInUseCase {
  constructor(
    @inject('UserRepo') private users: UserRepositoryPort,
    @inject('HashServicePort') private hash: HashServicePort,
    @inject('TokenServicePort') private jwt: TokenServicePort,
    @inject('UserAccountRepo')
    private userAccounts: UserAccountRepositoryPort,
  ) {}

  async execute(dto: SignInDto) {
    // 1) Verificar credenciales (igual que antes)
    const user = await this.users.findByLogin(dto.login);
    if (!user) throw new ApiError(401, 'INVALID_CREDENTIALS');

    const okPwd = await this.hash.compare(dto.password, user.passwordHash);
    if (!okPwd) throw new ApiError(401, 'INVALID_CREDENTIALS');

    if (!user.activo) throw new ApiError(403, 'USER_DISABLED');
    if (!user.emailVerified) throw new ApiError(403, 'EMAIL_NOT_VERIFIED');

    // 2) Obtener las cuentas del usuario
    const accounts = await this.userAccounts.findByUserId(user.id);

    if (!accounts.length) {
      // Usuario sin ninguna cuenta asociada → error de dominio
      throw new ApiError(403, 'USER_HAS_NO_ACCOUNT');
    }

    // 3) En esta primera fase: asumimos 1 cuenta por usuario
    //    Si hay más, por ahora tomamos la primera (luego haremos flujo multi-account)
    const activeAccount = accounts[0];

    // 4) Construir payload del JWT con accountId
    const payload: AccessTokenPayload = {
      sub: user.id,
      accountId: activeAccount.accountId,
      roles: user.roles.map((r) => r.name),
    };

    const accessToken = this.jwt.sign(payload);
    const refreshToken = this.jwt.signRefresh({ sub: user.id });

    return {
      userId: user.id,
      accountId: activeAccount.accountId, // útil para el front si quieres
      accessToken,
      refreshToken,
    };
  }
}
