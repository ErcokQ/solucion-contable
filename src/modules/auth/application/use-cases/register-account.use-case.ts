// src/modules/auth/application/use-cases/register-account.use-case.ts
import { injectable, inject } from 'tsyringe';

import {
  RegisterAccountDto,
  RegisterAccountResultDto,
} from '@auth/application/dto/register-account.dto';
import { ProductKeyRepositoryPort } from '@auth/application/ports/product-key-repository.port';
import { UserRepositoryPort } from '@auth/application/ports/user-repository.port';
import { RoleRepositoryPort } from '@auth/application/ports/role-repository.port';
import { HashServicePort } from '@auth/application/ports/hash-service.port';
import { TokenServicePort } from '@auth/application/ports/token-service.port';
import { EmailVerificationRepositoryPort } from '@auth/application/ports/email-verification-repository.port';
import { MailServicePort } from '@auth/application/ports/mail-service.port';

import { AccountRepositoryPort } from '@account/application/ports/account-repository.port';
import { CompanyRepositoryPort } from '@account/application/ports/company-repository.port';
import { UserAccountRepositoryPort } from '@auth/application/ports/user-account-repository.port';

import { ApiError } from '@shared/error/ApiError';
import { AccessTokenPayload } from '@auth/domain/types/access-token-payload.type';

import { User } from '@auth/domain/entities/user.entity';
import { Account } from '@account/domain/entities/account.entity';
import { Company } from '@account/domain/entities/company.entity';
import crypto from 'crypto';
import { config } from '@shared/config';

@injectable()
export class RegisterAccountUseCase {
  constructor(
    @inject('ProductKeyRepo')
    private readonly productKeys: ProductKeyRepositoryPort,

    @inject('UserRepo')
    private readonly users: UserRepositoryPort,

    @inject('RoleRepo')
    private readonly roles: RoleRepositoryPort,

    @inject('HashServicePort')
    private readonly hash: HashServicePort,

    @inject('TokenServicePort')
    private readonly tokens: TokenServicePort,

    @inject('EmailVerificationRepo')
    private readonly verifications: EmailVerificationRepositoryPort,

    @inject('MailServicePort')
    private readonly mail: MailServicePort,

    @inject('AccountRepo')
    private readonly accounts: AccountRepositoryPort,

    @inject('CompanyRepo')
    private readonly companies: CompanyRepositoryPort,

    @inject('UserAccountRepo')
    private readonly userAccounts: UserAccountRepositoryPort,
  ) {}

  async execute(dto: RegisterAccountDto): Promise<RegisterAccountResultDto> {
    const now = new Date();

    // --- 0) Validar / normalizar régimen fiscal opcional ---
    if (dto.companyTaxRegime) {
      const trimmed = dto.companyTaxRegime.trim();
      const isValidCode = /^[0-9]{3}$/.test(trimmed); // c_RegimenFiscal SAT

      if (!isValidCode) {
        throw new ApiError(400, 'INVALID_TAX_REGIME');
      }

      dto.companyTaxRegime = trimmed;
    }

    // --- 1) Validar product key ---
    const key = await this.productKeys.findByCode(dto.productKey);
    if (!key) throw new ApiError(400, 'INVALID_PRODUCT_KEY');

    if (key.type !== 'account') {
      throw new ApiError(400, 'PRODUCT_KEY_NOT_FOR_ACCOUNT');
    }

    if (key.expiresAt && key.expiresAt < now) {
      throw new ApiError(400, 'PRODUCT_KEY_EXPIRED');
    }

    if (key.used || key.usedCount >= key.maxUses) {
      throw new ApiError(400, 'PRODUCT_KEY_ALREADY_USED');
    }

    // --- 2) Validar unicidad del owner ---
    const emailExists = await this.users.existsByEmail(dto.ownerEmail);
    if (emailExists) throw new ApiError(409, 'EMAIL_ALREADY_IN_USE');

    const usernameExists = await this.users.existsByUsername(dto.ownerUsername);
    if (usernameExists) throw new ApiError(409, 'USERNAME_ALREADY_IN_USE');

    // --- 3) Crear usuario owner ---
    const passwordHash = await this.hash.hash(dto.ownerPassword);

    const owner = User.create(
      dto.ownerFullName,
      dto.ownerEmail,
      dto.ownerUsername,
      passwordHash,
    );

    await this.users.save(owner);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.verifications.create({
      userId: owner.id,
      tokenHash,
      expiresAt,
    });

    const verifyUrl = `${config.URL_FRONTEND}/verify-email?token=${rawToken}`;
    await this.mail.sendEmailVerification(owner.email, verifyUrl);

    // --- 4) Crear Account ---
    const account = new Account();
    account.name = dto.accountName;
    account.plan = 'single'; // TODO: mapear desde ProductKey
    account.maxUsers = 5; // TODO: ajustar por plan
    account.maxCompanies = 3; // TODO: ajustar por plan
    account.active = true;

    await this.accounts.save(account);

    // --- 5) Crear Company principal ---
    const company = new Company();
    company.accountId = account.id;
    company.name = dto.companyName;
    company.rfc = dto.companyRfc;
    company.taxRegime = dto.companyTaxRegime;
    company.active = true;

    await this.companies.save(company);

    // --- 6) Rol de owner ---
    const ownerRole = await this.roles.findByName('account_owner');
    if (!ownerRole) {
      throw new Error('Rol account_owner no encontrado en base de datos');
    }

    // 6.1) Asociación user ↔ account (membership)
    await this.userAccounts.createLink({
      userId: owner.id,
      accountId: account.id,
      roleId: ownerRole.id, // redundante pero útil en reporting
      isOwner: true,
    });

    // 6.2) Asignar rol al usuario (user_roles = fuente de verdad de permisos)
    owner.roles = [ownerRole];
    await this.users.save(owner);

    // --- 7) Marcar product key como usada y ligarla al account ---
    key.accountId = account.id;
    key.usedCount = Math.min(key.maxUses, key.usedCount + 1);
    if (key.usedCount >= key.maxUses) {
      key.used = true;
    }

    await this.productKeys.save(key);

    // --- 8) Construir roles para el token ---
    const rolesForToken = [ownerRole.name];

    const payload: AccessTokenPayload = {
      sub: owner.id,
      accountId: account.id,
      roles: rolesForToken,
    };

    const accessToken = this.tokens.sign(payload);
    const refreshToken = this.tokens.signRefresh({ sub: owner.id });

    // --- 9) DTO de salida ---
    return {
      tokens: {
        accessToken,
        refreshToken,
      },
      requiresEmailVerification: true,
      user: {
        id: owner.id,
        fullName: owner.fullName,
        email: owner.email,
      },
      account: {
        id: account.id,
        name: account.name,
        plan: account.plan,
        maxUsers: account.maxUsers,
        maxCompanies: account.maxCompanies,
      },
      company: {
        id: company.id,
        name: company.name,
        rfc: company.rfc,
      },
    };
  }
}
