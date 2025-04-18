import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Users } from 'src/entities/users.entity';
import { EntityManager, Repository } from 'typeorm';

import { responseObj } from 'src/util/responseObj';

import { JwtService } from '@nestjs/jwt';
import { AdminUser } from 'src/entities/admin_user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Log } from 'src/entities/log.entity';
import { CreatePurchaseVerificationDto } from './dto/purchase-verification.dto';

import { RequestWithUser } from 'src/types/requestWithUser.types';
import { SignInDto } from './dto/sign-in.dto';
import { PurchaseVerification } from 'src/entities/purchaseverification.entity';
import { VisitLog } from 'src/entities/visit_log.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(AdminUser)
    private readonly adminUserRepository: Repository<AdminUser>,
    @InjectRepository(PurchaseVerification)
    private readonly purchaseVerificationRepository: Repository<PurchaseVerification>,
    @InjectRepository(VisitLog)
    private readonly visitLogRepository: Repository<VisitLog>,
    private readonly jwtService: JwtService,
    readonly entityManager: EntityManager,
  ) {}

  /**
   * 유저 회원가입
   * @param {SiginUpDto} siginUpDto 아이디
   * @returns {{ success:boolean; accessToken: string; refreshToken: string }} 유저정보
   */
  async createUser(createUserDto: CreateUserDto) {
    console.log('createUserDto : ', createUserDto);
    try {
      await this.entityManager.transaction(async (queryManager) => {
        // 비밀번호 암호화
        createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
        const user: any = await queryManager.save(Users, {
          ...createUserDto,
        });

        /** 로그 저장 */
        await queryManager.save(Log, {
          status: 'CREATE',
          description: `회원가입`,
          changeId: user.id,
          updateId: user.id,
        });
      });

      return responseObj.success(null, '회원가입 성공');
    } catch (e: any) {
      console.error(e);
      return responseObj.fail(e.message);
    }
  }

  /**
   * 유저(부모) 아이디 중복 확인 - 로컬
   * @param {string} user_id 아이디
   * @returns {{ success:boolean }} 유저정보
   */
  async isUserIdUnique(user_id: string) {
    try {
      const isUser = await this.userRepository.findOne({
        where: { user_id: user_id, provider: 'local' },
      });

      if (isUser !== null) {
        return responseObj.fail('이미 사용중인 아이디 입니다.');
      }

      return responseObj.success(null, '사용가능한 아이디 입니다.');
    } catch (e: any) {
      throw new HttpException(
        '아이디 중복 확인 중 오류가 발생했습니다. 다시 시도해주세요.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 로그인
   * @param siginInDto:SignInDto
   * @returns {{ accessToken: string; refreshToken: string }} 유저정보
   */
  async signIn(siginInDto: SignInDto) {
    const { user_id, password } = siginInDto;
    // 아이디 비밀번호 검증
    const user = await this.validateUser({ user_id, password });

    if (!user) {
      return responseObj.fail(
        '아이디 또는 비밀번호를 잘못 입력했습니다. 입력하신 내용을 다시 확인해주세요.',
      );
    }

    const payload = {
      user_id: user.user_id,
      username: user.username,
      id: user.id,
    };

    const accessToken = this.createAccessToken(payload);
    const refreshToken = this.createRefreshToken(payload);

    console.log({
      accessToken,
      refreshToken,
      userInfo: {
        id: user.id,
        user_id: user.user_id,
        username: user.username,
        provider: user.provider,
        gender: user.gender,
        is_first_login: user.isFirstLogin,
      },
    });
    return responseObj.success({
      accessToken,
      refreshToken,
      userInfo: {
        id: user.id,
        user_id: user.user_id,
        username: user.username,
        provider: user.provider,
        gender: user.gender,
        is_first_login: user.isFirstLogin,
      },
    });
  }

  // 그로우러닝 구매 인증
  async findPurchaseVerification(
    createPurchaseVerificationDto: CreatePurchaseVerificationDto,
    req: RequestWithUser,
  ) {
    // 유저 실제 아이디 not id(uuid)
    const { id: userUUID } = req.user;
    Logger.log('id : ', userUUID);
    try {
      // 이미 구매인증 요청한 유저인지 먼저 확인
      const isRequested = await this.purchaseVerificationRepository.findOne({
        where: {
          user: {
            id: userUUID,
          },
        },
      });

      if (isRequested) {
        return responseObj.fail('이미 구매 인증 요청한 유저입니다.');
      }

      if (createPurchaseVerificationDto.type === 'later') {
        await this.entityManager.transaction(async (queryManager) => {
          await queryManager.update(
            Users,
            { id: userUUID },
            { isFirstLogin: false },
          );
        });
        return responseObj.success(null, '나중에 하기 처리 완료');
      }

      await this.entityManager.transaction(async (queryManager) => {
        await queryManager.save(PurchaseVerification, {
          ...createPurchaseVerificationDto,
          user: {
            id: userUUID,
          },
        });

        await queryManager.update(
          Users,
          { id: userUUID },
          { isFirstLogin: false },
        );
      });

      return responseObj.success(null, '그러우러닝 구매 인증 완료');
    } catch (e: any) {
      console.error(e);
      return responseObj.fail(e.message);
    }
  }

  async saveUserLearningPassword(grow_learning_password, req) {
    try {
      await this.userRepository.save({
        grow_learning_password: grow_learning_password,
        id: req.id,
      });

      return responseObj.success(true, '변경 완료');
    } catch (error: any) {
      console.log('@@ ERROR!!: ', error);
      return responseObj.fail(error.message);
    }
  }

  /** 일반 유저 검증 */
  public async validateUser({
    user_id,
    password,
  }: {
    user_id: string;
    password: string;
  }) {
    try {
      const user = await this.userRepository.findOne({
        where: { user_id },
      });

      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return null;
      }

      return user;
    } catch (e) {
      throw new HttpException('서버요청 에러!', 500);
    }
  }

  /**
   * ==========================================================================================
   *                                  수정 부분 구분
   * ==========================================================================================
   */

  async refreshToken(refreshToken: string) {
    try {
      // 리프레시 토큰 검증
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.ADMIN_JWT_REFRESH_SECRET, // 리프레시 토큰용 시크릿 키
      });

      // 유저가 여전히 존재하는지 확인 (선택 사항)
      // const user = await this.userService.findById(payload.id);
      // if (!user) {
      //   throw new UnauthorizedException('유저가 존재하지 않습니다.');
      // }

      // 새로운 액세스 토큰 생성
      const newAccessToken = this.jwtService.sign(
        {
          id: payload.id,
          userId: payload.userId,
          userName: payload.userName,
          company: payload.company,
          type: payload.type,
        },
        {
          secret: process.env.ADMIN_JWT_SECRET, // 액세스 토큰용 시크릿 키
          expiresIn: '180d', // 액세스 토큰 유효 기간 설정
        },
      );

      // 필요하다면 새로운 리프레시 토큰도 생성 가능
      const newRefreshToken = this.jwtService.sign(
        {
          id: payload.id,
          userId: payload.userId,
          userName: payload.userName,
          company: payload.company,
          type: payload.type,
        },
        {
          secret: process.env.ADMIN_JWT_REFRESH_SECRET,
          expiresIn: '360d', // 리프레시 토큰 유효 기간 설정
        },
      );

      // 새로 생성한 토큰 반환
      // return { accessToken: newAccessToken };
      // 리프레시 토큰도 함께 반환하려면 아래처럼 반환
      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }
  }

  /**
   * 새로 고침시 마다 유저 정보 확인
   */
  async getCurrentUser(req: RequestWithUser) {
    try {
      const { profile_id } = req.headers;
      const { user_id, id: userUUID } = req.user;

      Logger.log('profile_id!! : ', profile_id);

      // 자녀 프로필 방문 기록 확인
      if (profile_id) {
        // 오늘 날짜의 방문 기록 확인
        const existingVisit = await this.visitLogRepository
          .createQueryBuilder('visit_log')
          .where('visit_log.child_id = :profileId', { profileId: profile_id })
          .andWhere('visit_log.user_id = :userId', { userId: userUUID })
          .andWhere('DATE(visit_log.created_at) = DATE(:today)', {
            today: new Date().toISOString().split('T')[0],
          })
          .getOne();

        Logger.log('existingVisit query params:', {
          profileId: profile_id,
          userId: userUUID,
          today: new Date().toISOString().split('T')[0],
        });
        Logger.log('existingVisit result:', existingVisit);

        // 방문 기록이 없는 경우에만 새로운 기록 생성
        if (!existingVisit) {
          await this.visitLogRepository.save({
            child: {
              id: profile_id,
            },
            user: {
              id: userUUID,
            },
          });
        }
      }

      const user = await this.userRepository.findOne({
        where: { user_id: user_id },
      });

      if (!user) {
        return responseObj.fail();
      }

      return responseObj.success({
        id: user.id,
        user_id: user.user_id,
        username: user.username,
        provider: user.provider,
        gender: user.gender,
        is_first_login: user.isFirstLogin,
        grow_learning_password: user.grow_learning_password,
      });
    } catch (e: any) {
      throw new HttpException(
        '아이디 중복 확인 중 오류가 발생했습니다. 다시 시도해주세요.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 관리자 유저 검증
   */
  public async validateAdminUser({
    adminId,
    password,
  }: {
    adminId: string;
    password: string;
  }) {
    try {
      const user = await this.adminUserRepository.findOne({
        where: { admin_id: adminId },
        relations: ['company'],
      });

      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return null;
      }

      return user;
    } catch (e) {
      throw new HttpException('서버요청 에러!', 500);
    }
  }

  getAdminIp = async (req: any) => {
    try {
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      return responseObj.success(ip);
    } catch (e) {
      return responseObj.fail('IP를 가져오는데 실패했습니다.');
    }
  };

  createAccessToken = (payload: any) => {
    const ACCESS_TOKEN_EXPIRES = '180d'; //6개월
    const jwtSecretKey = this.configService.get('JWT_SECRET');

    return jwt.sign(payload, jwtSecretKey, {
      expiresIn: ACCESS_TOKEN_EXPIRES,
    });
  };

  createRefreshToken = (payload: any) => {
    const REFRESH_TOKEN_EXPIRES = '360d'; //1년
    const jwtRefreshSecretKey = this.configService.get('JWT_REFRESH_SECRET');

    return jwt.sign(payload, jwtRefreshSecretKey, {
      expiresIn: REFRESH_TOKEN_EXPIRES,
    });
  };
}
