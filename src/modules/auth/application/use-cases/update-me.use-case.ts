import { injectable, inject } from 'tsyringe';
import { UserRepositoryPort } from '@auth/application/ports/user-repository.port';
import { ApiError } from '@shared/error/ApiError';
import { UpdateMeDto } from '@auth/application/dto/user-profile.dto';
import { GetMeUseCase, MeDto } from './get-me.use-case';

@injectable()
export class UpdateMeUseCase {
  constructor(
    @inject('UserRepo') private readonly users: UserRepositoryPort,
    private readonly getMe: GetMeUseCase,
  ) {}

  async execute(userId: number, dto: UpdateMeDto): Promise<MeDto> {
    const user = await this.users.findById(userId);
    if (!user) throw new ApiError(404, 'USER_NOT_FOUND');

    await this.users.update(userId, { fullName: dto.fullName });

    return this.getMe.execute(userId);
  }
}
