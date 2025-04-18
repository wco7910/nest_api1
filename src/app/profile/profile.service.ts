import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserTopic } from 'src/entities/user_topics.entity';
import { EntityManager, In, Repository } from 'typeorm';
import { SelectTopicDto } from './dto/selectTopic.dto';
import { RequestWithUser } from 'src/types/requestWithUser.types';
import { responseObj } from 'src/util/responseObj';
import { Topic } from 'src/entities/topics.entity';
import { Users } from 'src/entities/users.entity';
import { ChildrenProfile } from 'src/entities/children_profile.entity';
// import { Log } from 'src/entities/log.entity';
import { CreateChildProfileDto } from './dto/createChildProfile.dto';
import { Log } from 'src/entities/log.entity';
import { ProfileImageFile } from 'src/entities/profile_image_files.entity';

import { UserPoint } from 'src/entities/user_points.entity';
import { UserPointHistory } from 'src/entities/user_point_histories.entity';
import { MathProgress } from 'src/entities/math_unit_progress.entity';
import { BlockProgress } from 'src/entities/block_progress.entity';
import { ArtProgress } from 'src/entities/art_progress.entity';
import { KoreanProgress } from 'src/entities/korean_unit_progress.entity';
import { EnglishProgress } from 'src/entities/english_unit_progress.entity';

@Injectable()
export class ProfileService {
  constructor(
    readonly entityManager: EntityManager,
    // @InjectRepository(UserTopic)
    // private readonly userTopicRepository: Repository<UserTopic>,
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(ChildrenProfile)
    private readonly childrenProfileRepository: Repository<ChildrenProfile>,
    @InjectRepository(ProfileImageFile)
    private readonly profileImageFileRepository: Repository<ProfileImageFile>,
    /** 포인트 총합 조회 */
    @InjectRepository(UserPoint)
    private readonly userPointRepository: Repository<UserPoint>,

    /** 포인트 히스토리 조회 */
    @InjectRepository(UserPointHistory)
    private readonly userPointHistoryRepository: Repository<UserPointHistory>,
  ) {}

  async getTopics(in_used: string = 'T') {
    try {
      const where = in_used === 'used' ? { in_used: 'T' } : {};
      const topics = await this.topicRepository.find({
        where,
        order: {
          sort: 'ASC',
        },
      });
      return responseObj.success(topics);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  async setUserTopics(selectTopicDto: SelectTopicDto, req: RequestWithUser) {
    const { id }: { id: Users['id'] } = req.user;

    try {
      await this.entityManager.transaction(async (queryManager) => {
        // 현재 로그인한 유저의 관심주제를 모두 검색
        const userTopics = await queryManager.find(UserTopic, {
          where: {
            user: {
              id: id,
            },
          },
        });

        // 검색한 관심 주제 삭제
        await queryManager.remove(UserTopic, userTopics);

        // 배열에 담겨온 topicIds를 이용하여 Topic 엔티티에서 해당하는 항목들을 전부 조회
        const topics = await this.getTopicsByIds(selectTopicDto?.topicIds);

        // UserTopic 엔티티에 저장할 데이터를 생성
        const userTopicsToSave = topics.map((topic) => {
          const userTopic: any = new UserTopic();

          userTopic.user = id;
          userTopic.topic = topic.id;
          return userTopic;
        });

        // UserTopic 엔티티에 저장
        await queryManager.save(userTopicsToSave);
      });

      return responseObj.success();
    } catch (e: any) {
      console.log('e.message', e.message);
      return responseObj.fail(e.message);
    }
  }

  async getDefaultUserProfile() {
    const profiles = await this.profileImageFileRepository.find({
      where: {
        fileType: 'default',
      },
    });
    console.log(profiles);
    return responseObj.success(profiles);
  }

  async getUserProfiles(userUUID: string) {
    try {
      const profiles = await this.childrenProfileRepository
        .createQueryBuilder('children_profile')
        .innerJoin(
          ProfileImageFile,
          'profile_image',
          'children_profile.profile_image_id = profile_image.id',
        )
        .select('children_profile.id', 'id')
        .addSelect('children_profile.name', 'name')
        .addSelect('children_profile.birth_date', 'birth_date')
        .addSelect('children_profile.gender', 'gender')
        // 프로필 이미지 관련 필드 추가
        .addSelect('profile_image.id', 'profile_image_id')
        .addSelect('profile_image.originalname', 'profile_image_originalname')
        .addSelect('profile_image.path', 'profile_image_path')
        .addSelect('profile_image.size', 'profile_image_size')
        .addSelect('profile_image.mimetype', 'profile_image_mimetype')
        .addSelect('profile_image.updated_at', 'profile_image_updated_at')
        .where('children_profile.parent_id = :parent_id', {
          parent_id: userUUID,
        })
        .getRawMany();

      // 응답 데이터 구조 변경
      const processedProfiles = profiles.map((profile) => ({
        id: profile.id,
        name: profile.name,
        birth_date: profile.birth_date,
        gender: profile.gender,
        profile_image: {
          id: profile.profile_image_id,
          originalname: profile.profile_image_originalname,
          path: profile.profile_image_path,
          size: profile.profile_image_size,
          mimetype: profile.profile_image_mimetype,
          updated_at: profile.profile_image_updated_at,
        },
      }));

      return responseObj.success(processedProfiles || []);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  async getSelectedChildProfile(userUUID: string, childId: string) {
    try {
      Logger.log(userUUID, 'userUUID');
      Logger.log(childId, 'childId');

      const profile = await this.childrenProfileRepository
        .createQueryBuilder('children_profile')
        .innerJoin(
          ProfileImageFile,
          'profile_image',
          'children_profile.profile_image_id = profile_image.id',
        )
        .leftJoin(Users, 'user', 'children_profile.parent_id = user.id')
        .leftJoin(
          MathProgress,
          'math',
          'children_profile.id = math.child_profile_id',
        )
        .leftJoin(
          BlockProgress,
          'block',
          'children_profile.id = block.child_profile_id',
        )
        .leftJoin(
          ArtProgress,
          'art',
          'children_profile.id = art.child_profile_id',
        )
        .leftJoin(
          KoreanProgress,
          'korean',
          'children_profile.id = korean.child_profile_id',
        )
        .leftJoin(
          EnglishProgress,
          'english',
          'children_profile.id = english.child_profile_id',
        )
        .select('children_profile.id', 'id')
        .addSelect('user.grow_learning_password', 'grow_learning_password')
        .addSelect('children_profile.name', 'name')
        .addSelect('children_profile.birth_date', 'birth_date')
        .addSelect('children_profile.gender', 'gender')
        // 프로필 이미지 관련 필드 추가
        .addSelect('profile_image.id', 'profile_image_id')
        .addSelect('profile_image.originalname', 'profile_image_originalname')
        .addSelect('profile_image.path', 'profile_image_path')
        .addSelect('profile_image.size', 'profile_image_size')
        .addSelect('profile_image.mimetype', 'profile_image_mimetype')
        .addSelect('profile_image.updated_at', 'profile_image_updated_at')
        // 클리어 개수
        .addSelect('COUNT(DISTINCT block.id)', 'block_count')
        .addSelect('COUNT(DISTINCT art.id)', 'art_count')
        .addSelect('COUNT(DISTINCT math.id)', 'math_count')
        .addSelect('COUNT(DISTINCT english.id)', 'english_count')
        .addSelect('COUNT(DISTINCT korean.id)', 'korean_count')
        .where('children_profile.parent_id = :parent_id', {
          parent_id: userUUID,
        })
        .andWhere('children_profile.id = :id', {
          id: childId,
        })
        .groupBy(
          'children_profile.id, profile_image.id, user.grow_learning_password',
        )
        .getRawOne();

      // 응답 데이터 구조 변경
      const formattedProfile = {
        id: profile.id,
        name: profile.name,
        birth_date: profile.birth_date,
        gender: profile.gender,
        grow_learning_password: profile.grow_learning_password,
        profile_image: {
          id: profile.profile_image_id,
          originalname: profile.profile_image_originalname,
          path: profile.profile_image_path,
          size: profile.profile_image_size,
          mimetype: profile.profile_image_mimetype,
          updated_at: profile.profile_image_updated_at,
        },
        category_info: {
          block_count: Number(profile.block_count),
          art_count: Number(profile.art_count),
          math_count: Number(profile.math_count),
          english_count: Number(profile.english_count),
          korean_count: Number(profile.korean_count),
          coding_count: 0,
        },
      };

      return responseObj.success(formattedProfile);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  // 자녀 프로필 추가
  async createChildProfile(
    createChildProfileDto: CreateChildProfileDto,
    req: RequestWithUser,
  ) {
    const { id: userUUID } = req.user;

    try {
      await this.entityManager.transaction(async (queryManager) => {
        // 이미 등록된 자녀인지 확인 ( 부모 아이디와 자녀 이름으로 확인
        // [ 동일한 자녀이름으로 생성 불가 조건 ])
        const isChild = await queryManager.findOne(ChildrenProfile, {
          where: {
            parent: {
              id: userUUID,
            },
            name: createChildProfileDto.name,
          },
        });

        if (isChild) {
          throw new Error('이미 등록된 자녀입니다.');
        }

        let profileImage = null;
        // createChildProfileDto.icon 값이 null이면 프로필 사진 이미지 업로드
        if (
          createChildProfileDto.profile_file_info &&
          createChildProfileDto.icon === null
        ) {
          Logger.log('첨부한 프로필 이미지 존재 경우');
          profileImage = await queryManager.save(ProfileImageFile, {
            path: createChildProfileDto.profile_file_info.path,
            originalname: createChildProfileDto.profile_file_info.originalname,
            mimetype: createChildProfileDto.profile_file_info.mimetype,
            size: createChildProfileDto.profile_file_info.size,
          });
          await queryManager.update(
            Users,
            { id: userUUID },
            { profile_image_id: profileImage.id },
          );
        }

        // 자녀 프로필 추가
        const child = await queryManager.save(ChildrenProfile, {
          name: createChildProfileDto.name,
          birth_date: createChildProfileDto.birth_date,
          gender: createChildProfileDto.gender,
          icon: createChildProfileDto.icon,
          profile_text: createChildProfileDto.profile_text,
          parent: {
            id: userUUID,
          },
          profile_image_id:
            createChildProfileDto.icon === null
              ? profileImage.id
              : createChildProfileDto.icon, // 프로필 아이콘 선택시 아이콘 이미지 파일 테이블 id 값(프로필 이미지 업로드 대체)
        });

        /** 로그 저장 */
        await queryManager.save(Log, {
          status: 'CREATE',
          description: `자녀 프로필 추가`,
          changeId: child.id,
          updateId: userUUID,
        });

        return child; // 트랜잭션 내부에서 자녀 프로필을 반환
      });

      // 트랜잭션이 성공적으로 완료되면 응답 생성
      return responseObj.success(null, '자녀 프로필 추가 성공');
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  /** 선택한 자녀의 프로필의 모든 학습 포인트 총합 조회 */
  async getSelectedChildProfilePoint(userUUID: string, childId: string) {
    const point = await this.userPointRepository.find({
      where: {
        child: {
          id: childId,
        },
        user: {
          id: userUUID,
        },
      },
    });

    const totalPoints = point.reduce((acc, curr) => acc + curr.total_points, 0);
    return responseObj.success(totalPoints);
  }

  /** 포인트 히스토리 조회 */
  async getPointHistory(userUUID: string, childId: string) {
    /** 1. 포인트 총합 조회 */
    const point = await this.userPointRepository.find({
      where: {
        child: {
          id: childId,
        },
        user: {
          id: userUUID,
        },
      },
    });
    // 총합 합산 : return : number
    const totalPoints: number = point.reduce(
      (acc, curr) => acc + curr.total_points,
      0,
    );

    /** 2. 포인트 히스토리 리스트 */
    const pointHistory: UserPointHistory[] =
      await this.userPointHistoryRepository.find({
        where: {
          child: { id: childId },
          user: { id: userUUID },
        },
        order: {
          created_at: 'DESC',
        },
      });

    console.log({
      totalPoints: totalPoints,
      pointHistory: pointHistory,
    });
    return responseObj.success({
      totalPoints: totalPoints,
      pointHistory: pointHistory,
    });
  }

  /** 선택한 자녀의 프로필의 학습별(블럭, 한글, 영어,,)포인트 현황 조회 */
  async getSelectedChildProfileCategoryPoint(
    userUUID: string,
    childId: string,
    pointCategory: string,
  ) {
    try {
      console.log('userUUID', userUUID);
      console.log('childId', childId);

      const point = await this.userPointRepository.findOne({
        where: {
          child: {
            id: childId,
          },
          user: {
            id: userUUID,
          },
          point_category: pointCategory,
        },
      });
      console.log(point, 'point');

      if (!point) {
        return responseObj.fail('포인트 정보를 찾을 수 없습니다.');
      }

      if (!point.total_points) {
        return responseObj.success(0); // 포인트가 없으면 0 반환
      }

      return responseObj.success(point.total_points);
    } catch (e: any) {
      Logger.error(`${e.message}`, 'getSelectedChildProfileCategoryPoint');
      return responseObj.fail(e.message);
    }
  }

  // ======================================== 함수 추가 ========================================
  async getTopicsByIds(topicIds: string[]): Promise<Topic[]> {
    // Topic 엔티티에서 배열로 제공된 topicIds에 해당하는 항목들을 전부 조회
    const topics = await this.topicRepository.find({
      where: {
        id: In(topicIds),
      },
    });

    return topics;
  }
}
