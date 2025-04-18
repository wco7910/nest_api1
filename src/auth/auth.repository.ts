import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { Repository } from 'typeorm';

export class AuthRepository {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly configService: ConfigService,
  ) {}

  public async validateUser({
    userId,
    password,
  }: {
    userId: string;
    password: string;
  }) {
    const secretKey = this.configService.get('SECRET_KEY');
    const queryBuilder = this.userRepository
      .createQueryBuilder('users')
      .select(['users.user_id, users.name'])
      .where('user.user_id = :userId', { userId: userId })
      .andWhere(
        'AES_DECRYPT(user.password, SHA2(:secretKey, 512)) = :password',
        {
          secretKey: secretKey,
          password: password,
        },
      );

    return queryBuilder.getOne();
  }
}
