import { injectable, inject } from 'tsyringe';
import { SignInDto } from '../dto/signin.dto';
import { UserRepositoryPort } from '../ports/user-repository.port';
import { HashServicePort } from '../ports/hash-service.port';
import { TokenServicePort } from '../ports/token-service.port';
import { ApiError } from '@shared/error/ApiError';

@injectable()
export class SignInUseCase {
  constructor(
    @inject('UserRepo') private users: UserRepositoryPort,
    @inject('HashService') private hash: HashServicePort,
    @inject('TokenService') private jwt: TokenServicePort,
  ) {}

  async execute(dto: SignInDto) {
    const user = await this.users.findByLogin(dto.login);
    if (!user) throw new ApiError(401, 'INVALID_CREDENTIALS');
    const OkPwd = await this.hash.compare(dto.password, user.passwordHash);
    if (!OkPwd) throw new ApiError(401, 'INVALID_CREDENTIALS');
    if (!user.activo) throw new ApiError(403, 'USER_DISABLED');

    const accessToken = this.jwt.sign({ sub: user.id });
    const refreshToken = this.jwt.signRefresh({ sub: user.id });

    return {
      userId: user.id,
      accessToken,
      refreshToken,
    };
  }
}
