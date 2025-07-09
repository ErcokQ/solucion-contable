import { injectable, inject } from 'tsyringe';
import { SignUpDto } from '../dto/signup.dto';
import { UserRepositoryPort } from '../ports/user-repository.port';
import { RoleRepositoryPort } from '../ports/role-repository.port';
import { HashServicePort } from '../ports/hash-service.port';
import { TokenServicePort } from '../ports/token-service.port';
import { ApiError } from '@shared/error/ApiError';
import { User } from '../../domain/entities/user.entity';

@injectable()
export class SignupUseCase {
  constructor(
    @inject('UserRepo') private users: UserRepositoryPort,
    @inject('RoleRepo') private roles: RoleRepositoryPort,
    @inject('HashServicePort') private hash: HashServicePort,
    @inject('TokenServicePort') private jwt: TokenServicePort,
  ) {}

  async execute(dto: SignUpDto) {
    if (await this.users.existsByEmail(dto.email))
      throw new ApiError(409, 'EMAIL_ALREADY_EXISTS');
    if (await this.users.existsByUsername(dto.username))
      throw new ApiError(409, 'USERNAME_ALREADY_EXISTS');

    /* 2. Crear usuario */
    const pwdHash = await this.hash.hash(dto.password);
    const user = User.create(dto.fullName, dto.email, dto.username, pwdHash);

    /* 3. Asignar rol “user” */
    const roleUser = await this.roles.findByName('user');
    if (!roleUser) throw new ApiError(500, 'ROLE_USER_NOT_FOUND'); // seed faltante
    user.roles = [roleUser];

    await this.users.save(user);

    return {
      userId: user.id,
      accessToken: this.jwt.sign({ sub: user.id, roles: ['user'] }),
      refreshToken: this.jwt.signRefresh({ sub: user.id }),
    };
  }
}
