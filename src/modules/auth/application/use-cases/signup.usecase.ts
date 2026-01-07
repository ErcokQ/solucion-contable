import { injectable, inject } from 'tsyringe';
import { SignUpDto } from '../dto/signup.dto';
import { UserRepositoryPort } from '../ports/user-repository.port';
import { RoleRepositoryPort } from '../ports/role-repository.port';
import { HashServicePort } from '../ports/hash-service.port';
import { TokenServicePort } from '../ports/token-service.port';
import { ApiError } from '@shared/error/ApiError';
import { User } from '../../domain/entities/user.entity';
import { ProductKeyRepositoryPort } from '../ports/product-key-repository.port';
import { EmailVerificationRepositoryPort } from '../ports/email-verification-repository.port';
import { MailServicePort } from '../ports/mail-service.port';
import crypto from 'crypto';
import { config } from '@shared/config';

@injectable()
export class SignupUseCase {
  constructor(
    @inject('UserRepo') private users: UserRepositoryPort,
    @inject('RoleRepo') private roles: RoleRepositoryPort,
    @inject('HashServicePort') private hash: HashServicePort,
    @inject('TokenServicePort') private jwt: TokenServicePort,
    @inject('ProductKeyRepo') private productKeys: ProductKeyRepositoryPort,
    @inject('EmailVerificationRepo')
    private verifications: EmailVerificationRepositoryPort,
    @inject('MailServicePort') private mail: MailServicePort,
  ) {}

  async execute(dto: SignUpDto) {
    if (await this.users.existsByEmail(dto.email))
      throw new ApiError(409, 'EMAIL_ALREADY_EXISTS');
    if (await this.users.existsByUsername(dto.username))
      throw new ApiError(409, 'USERNAME_ALREADY_EXISTS');

    // 2. Validar clave de producto
    const key = await this.productKeys.findByCode(dto.productKey);
    if (!key || key.used) throw new ApiError(400, 'INVALID_PRODUCT_KEY');

    /* 2. Crear usuario */
    const pwdHash = await this.hash.hash(dto.password);
    const user = User.create(dto.fullName, dto.email, dto.username, pwdHash);

    /* 3. Asignar rol “user” */
    const roleUser = await this.roles.findByName('user');
    if (!roleUser) throw new ApiError(500, 'ROLE_USER_NOT_FOUND'); // seed faltante
    user.roles = [roleUser];

    await this.users.save(user);
    await this.productKeys.markAsUsed(key.id);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.verifications.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const verifyUrl = `${config.URL_FRONTEND}/verify-email?token=${rawToken}`;
    await this.mail.sendEmailVerification(user.email, verifyUrl);

    return {
      userId: user.id,
      accessToken: this.jwt.sign({ sub: user.id, roles: ['user'] }),
      refreshToken: this.jwt.signRefresh({ sub: user.id }),
      requiresEmailVerification: true,
    };
  }
}
