import { injectable, inject } from 'tsyringe';
import { SignUpDto } from '../dto/signup.dto';
import { UserRepositoryPort } from '../ports/user-repository.port';
import { HashServicePort } from '../ports/hash-service.port';
import { TokenServicePort } from '../ports/token-service.port';
import { ApiError } from '@shared/error/ApiError';
import { User } from '../../domain/entities/user.entity';

@injectable()
export class SignupUseCase {
  constructor(
    @inject('UserRepo') private users: UserRepositoryPort,
    @inject('HashService') private hash: HashServicePort,
    @inject('TokenService') private jwt: TokenServicePort,
  ) {}

  async execute(dto: SignUpDto) {
    if (await this.users.existsByEmail(dto.email))
      throw new ApiError(409, 'EMAIL_ALREADY_EXISTS');
    if (await this.users.existsByUsername(dto.username))
      throw new ApiError(409, 'USERNAME_ALREADY_EXISTS');

    const pwdHash = await this.hash.hash(dto.password);
    const user = User.create(dto.fullName, dto.email, dto.username, pwdHash);
    await this.users.save(user);

    return {
      userId: user.id,
      accessToken: this.jwt.sign({ sub: user.id }),
      refreshToken: this.jwt.signRefresh({ sub: user.id }),
    };
  }
}
